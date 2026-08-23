plugins {
    id("fabric-loom") version "1.17.19"
    kotlin("jvm") version "2.4.10"
}

version = project.property("mod_version") as String
group = project.property("maven_group") as String

base {
    archivesName.set(project.property("mod_id") as String)
}

repositories {
    mavenCentral()
    // Cobblemon so publica no maven proprio deles (via Modrinth) — restrito
    // ao grupo maven.modrinth pra nao virar um mirror geral do Modrinth.
    exclusiveContent {
        forRepository { maven("https://api.modrinth.com/maven") }
        filter { includeGroup("maven.modrinth") }
    }
}

dependencies {
    minecraft("com.mojang:minecraft:${project.property("minecraft_version")}")
    mappings(loom.officialMojangMappings())

    modImplementation("net.fabricmc:fabric-loader:${project.property("fabric_loader_version")}")
    modImplementation("net.fabricmc.fabric-api:fabric-api:${project.property("fabric_api_version")}")
    modImplementation("net.fabricmc:fabric-language-kotlin:${project.property("fabric_language_kotlin_version")}")

    // Cobblemon-fabric 1.7.3+1.21.1 — mesma versao instalada no servidor.
    modImplementation("maven.modrinth:cobblemon:${project.property("cobblemon_modrinth_version")}")

    // rctapi/rctmod (Radical Cobblemon Trainers) — mesmas versoes instaladas
    // no servidor, usadas pra ler progresso de treinador (series/ginasios).
    modImplementation("maven.modrinth:rctapi:${project.property("rctapi_modrinth_version")}")
    modImplementation("maven.modrinth:rctmod:${project.property("rctmod_modrinth_version")}")
}

java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(21))
    }
}

kotlin {
    jvmToolchain(21)
}

tasks.processResources {
    inputs.property("version", project.version)
    filesMatching("fabric.mod.json") {
        expand(mapOf("version" to project.version))
    }
}

tasks.withType<JavaCompile> {
    options.encoding = "UTF-8"
}
