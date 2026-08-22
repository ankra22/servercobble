package com.cobblemontracker.collector

import com.google.gson.JsonObject
import net.fabricmc.loader.api.FabricLoader
import org.slf4j.LoggerFactory
import java.io.BufferedWriter
import java.io.IOException
import java.nio.charset.StandardCharsets
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.StandardOpenOption
import java.util.concurrent.LinkedBlockingQueue

/**
 * Escreve eventos em `tracker-events/events.jsonl` (uma linha JSON por
 * evento) numa thread dedicada, pra nunca bloquear a thread principal do
 * servidor com I/O de disco.
 */
object TrackerEventWriter {
    private val logger = LoggerFactory.getLogger("cobblemon-tracker-collector")
    private val queue = LinkedBlockingQueue<String>()
    private val eventsFile: Path = FabricLoader.getInstance().gameDir.resolve("tracker-events").resolve("events.jsonl")

    private val worker = Thread({
        Files.createDirectories(eventsFile.parent)
        val writer: BufferedWriter = Files.newBufferedWriter(
            eventsFile,
            StandardCharsets.UTF_8,
            StandardOpenOption.CREATE,
            StandardOpenOption.APPEND,
        )
        writer.use { out ->
            while (true) {
                val line = queue.take()
                try {
                    out.write(line)
                    out.newLine()
                    out.flush()
                } catch (e: IOException) {
                    logger.error("Falha ao escrever evento em $eventsFile", e)
                }
            }
        }
    }, "cobblemon-tracker-event-writer").apply {
        isDaemon = true
    }

    fun start() {
        worker.start()
        logger.info("Cobblemon Tracker Collector escrevendo eventos em $eventsFile")
    }

    fun submit(event: JsonObject) {
        queue.put(event.toString())
    }
}
