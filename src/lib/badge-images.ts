/**
 * Mapa manual id-do-ginásio (gyms.json) -> caminho da imagem real da
 * insígnia em public/insignias/, pros líderes de ginásio que o usuário já
 * mandou. O que não está aqui cai no símbolo genérico (GymBadgeIcon) —
 * Elite Four, campeão e ginásios sem imagem ainda.
 */
export const BADGE_IMAGES: Record<string, string> = {
  kanto_brock: "/insignias/kanto/brock.png",
  kanto_misty: "/insignias/kanto/misty.png",
  kanto_ltsurge: "/insignias/kanto/ltsurge.png",
  kanto_erika: "/insignias/kanto/erika.png",
  kanto_koga: "/insignias/kanto/koga.png",
  kanto_sabrina: "/insignias/kanto/sabrina.png",
  kanto_blaine: "/insignias/kanto/blaine.png",
  kanto_giovanni: "/insignias/kanto/giovanni.png",

  johto_valerio: "/insignias/johto/valerio.png",
  johto_raffaello: "/insignias/johto/raffaello.png",
  johto_chiara: "/insignias/johto/chiara.png",
  johto_angelo: "/insignias/johto/angelo.png",
  johto_furio: "/insignias/johto/furio.png",
  johto_jasmine: "/insignias/johto/jasmine.png",
  johto_alfredo: "/insignias/johto/alfredo.png",
  johto_sandra: "/insignias/johto/sandra.png",

  hoenn_petra: "/insignias/hoenn/petra.png",
  hoenn_rudi: "/insignias/hoenn/rudi.png",
  hoenn_walter: "/insignias/hoenn/walter.png",
  hoenn_fiammetta: "/insignias/hoenn/fiammetta.png",
  hoenn_norman: "/insignias/hoenn/norman.png",
  hoenn_alice: "/insignias/hoenn/alice.png",
  hoenn_tell: "/insignias/hoenn/tell-e-pat.png",
  hoenn_adriano: "/insignias/hoenn/adriano.png",
  hoenn_pat: "/insignias/hoenn/tell-e-pat.png",

  sinnoh_pedro: "/insignias/sinnoh/pedro.png",
  sinnoh_gardenia: "/insignias/sinnoh/gardenia.png",
  sinnoh_marzia: "/insignias/sinnoh/marzia.png",
  sinnoh_omar: "/insignias/sinnoh/omar.png",
  sinnoh_fannie: "/insignias/sinnoh/fannie.png",
  sinnoh_ferruccio: "/insignias/sinnoh/ferruccio.png",
  sinnoh_bianca: "/insignias/sinnoh/bianca.png",
  sinnoh_corrado: "/insignias/sinnoh/corrado.png",
};
