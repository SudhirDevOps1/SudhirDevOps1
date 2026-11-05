import fs from 'node:fs';

const fontsCss = fs.readFileSync('assets/fonts.css', 'utf8');

// Match @font-face blocks
const fontFaceBlocks = fontsCss.match(/@font-face\s*\{[\s\S]*?\}/g) || [];
let archivoFont = '';
let jetbrainsFont = '';

for (const block of fontFaceBlocks) {
  if (block.includes("'Archivo Black'") || block.includes('"Archivo Black"')) {
    archivoFont = block;
  } else if (block.includes("'JetBrains Mono'") || block.includes('"JetBrains Mono"')) {
    jetbrainsFont = block;
  }
}

if (!archivoFont || !jetbrainsFont) {
  throw new Error('Required fonts not found in assets/fonts.css');
}

// 12 Technology Icons Path Definitions (Standard Simple Icons 24x24)
const icons = {
  typescript: "M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z",
  docker: "M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.082.185.185.186m-2.93 0h2.12a.186.186 0 00.184-.186V6.29a.185.185 0 00-.185-.185H8.1a.185.185 0 00-.185.185v1.887c0 .102.083.185.185.186m-2.964 0h2.119a.186.186 0 00.185-.186V6.29a.185.185 0 00-.185-.185H5.136a.186.186 0 00-.186.185v1.887c0 .102.084.185.186.186m5.893 2.715h2.118a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.184-.186h-2.12a.186.186 0 00-.186.186v1.887c0 .102.084.185.186.185m-2.92 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.082.185.185.185M23.763 9.89c-.065-.051-.672-.51-1.954-.51-.338.001-.676.03-1.01.087-.248-1.7-1.653-2.53-1.716-2.566l-.344-.199-.226.327c-.284.438-.49.922-.612 1.43-.23.97-.09 1.882.403 2.661-.595.332-1.55.413-1.744.42H.751a.751.751 0 00-.75.748 11.376 11.376 0 00.692 4.062c.545 1.428 1.355 2.48 2.41 3.124 1.18.723 3.1 1.137 5.275 1.137.983.003 1.963-.086 2.93-.266a12.248 12.248 0 003.823-1.389c.98-.567 1.86-1.288 2.61-2.136 1.252-1.418 1.998-2.997 2.553-4.4h.221c1.372 0 2.215-.549 2.68-1.009.309-.293.55-.65.707-1.046l.098-.288Z",
  python: "M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.18l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09zm13.09 3.95l.28.06.32.12.35.18.36.27.36.35.35.47.32.59.28.73.21.88.14 1.04.05 1.23-.06 1.23-.16 1.04-.24.86-.32.71-.36.57-.4.45-.42.33-.42.24-.4.16-.36.09-.32.05-.24.02-.16-.01h-8.22v.82h5.84l.01 2.76.02.36-.05.34-.11.31-.17.29-.25.25-.31.24-.38.2-.44.17-.51.15-.58.13-.64.09-.71.07-.77.04-.84.01-1.27-.04-1.07-.14-.9-.2-.73-.25-.59-.3-.45-.33-.34-.34-.25-.34-.16-.33-.1-.3-.04-.25-.02-.2.01-.13v-5.34l.05-.64.13-.54.21-.46.26-.38.3-.32.33-.24.35-.2.35-.14.33-.1.3-.06.26-.04.21-.02.13-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V6.07h2.09l.14.01zm-6.47 14.25l-.23.33-.08.41.08.41.23.33.33.23.41.08.41-.08.33-.23.23-.33.08-.41-.08-.41-.23-.33-.33-.23-.41-.08-.41.08z",
  kubernetes: "m10.204 14.35.007.01-.999 2.413a5.171 5.171 0 0 1-2.075-2.597l2.578-.437.004.005a.44.44 0 0 1 .484.606zm-.833-2.129a.44.44 0 0 0 .173-.756l.002-.011L7.585 9.7a5.143 5.143 0 0 0-.73 3.255l2.514-.725.002-.009zm1.145-1.98a.44.44 0 0 0 .699-.337l.01-.005.15-2.62a5.144 5.144 0 0 0-3.01 1.442l2.147 1.523.004-.002zm.76 2.75.723.349.722-.347.18-.78-.5-.623h-.804l-.5.623.179.779zm1.5-3.095a.44.44 0 0 0 .7.336l.008.003 2.134-1.513a5.188 5.188 0 0 0-2.992-1.442l.148 2.615.002.001zm10.876 5.97-5.773 7.181a1.6 1.6 0 0 1-1.248.594l-9.261.003a1.6 1.6 0 0 1-1.247-.596l-5.776-7.18a1.583 1.583 0 0 1-.307-1.34L2.1 5.573c.108-.47.425-.864.863-1.073L11.305.513a1.606 1.606 0 0 1 1.385 0l8.345 3.985c.438.209.755.604.863 1.073l2.062 8.955c.108.47-.005.963-.308 1.34zm-3.289-2.057c-.042-.01-.103-.026-.145-.034-.174-.033-.315-.025-.479-.038-.35-.037-.638-.067-.895-.148-.105-.04-.18-.165-.216-.216l-.201-.059a6.45 6.45 0 0 0-.105-2.332 6.465 6.465 0 0 0-.936-2.163c.052-.047.15-.133.177-.159.008-.09.001-.183.094-.282.197-.185.444-.338.743-.522.142-.084.273-.137.415-.242.032-.024.076-.062.11-.089.24-.191.295-.52.123-.736-.172-.216-.506-.236-.745-.045-.034.027-.08.062-.111.088-.134.116-.217.23-.33.35-.246.25-.45.458-.673.609-.097.056-.239.037-.303.033l-.19.135a6.545 6.545 0 0 0-4.146-2.003l-.012-.223c-.065-.062-.143-.115-.163-.25-.022-.268.015-.557.057-.905.023-.163.061-.298.068-.475.001-.04-.001-.099-.001-.142 0-.306-.224-.555-.5-.555-.275 0-.499.249-.499.555l.001.014c0 .041-.002.092 0 .128.006.177.044.312.067.475.042.348.078.637.056.906a.545.545 0 0 1-.162.258l-.012.211a6.424 6.424 0 0 0-4.166 2.003 8.373 8.373 0 0 1-.18-.128c-.09.012-.18.04-.297-.029-.223-.15-.427-.358-.673-.608-.113-.12-.195-.234-.329-.349a2.691 2.691 0 0 0-.111-.088.594.594 0 0 0-.348-.132.481.481 0 0 0-.356.19c-.198.24-.131.6.113.815.031.027.077.062.111.089.142.105.273.158.415.242.299.184.546.337.743.522.093.099.086.192.094.282.027.026.125.112.177.159a6.465 6.465 0 0 0-.936 2.163 6.45 6.45 0 0 0-.105 2.332l-.201.059c-.036.051-.111.176-.216.216-.257.081-.545.111-.895.148-.164.013-.305.005-.479.038-.042.008-.103.024-.145.034-.438.098-.718.52-.62.958.098.438.52.718.958.62l.145-.034c.231-.053.42-.047.606-.065.253-.024.475-.052.695-.12a4.416 4.416 0 0 1-.19.789l-2.489.845a1.59 1.59 0 0 1-1.018 1.954l5.773 1.925a6.49 6.49 0 0 0 1.99 1.155l1.01-2.443a5.184 5.184 0 0 1 2.879 1.258l-.666 2.625a.44.44 0 0 1-.532.324l-.01-.004-2.508-.944-.006.01a5.163 5.163 0 0 1-1.688 1.884l1.524 2.158.006-.003a.44.44 0 0 1 .608-.112l.006.004.819-2.483a5.158 5.158 0 0 1 2.615.116l1.246 2.378.007-.003a.44.44 0 0 1 .602-.158l.007.004.606-2.585a5.162 5.162 0 0 1 2.915-1.127l1.411 2.274a.44.44 0 0 1-.11.611l-.007.004-2.181 1.488a5.146 5.146 0 0 1 .73 3.255l2.514-.725.002-.009a.44.44 0 0 1 .562-.271zm-9.043-4.839a2.76 2.76 0 1 1 0-5.52 2.76 2.76 0 0 1 0 5.52z",
  nodejs: "M11.998 24c-.321 0-.641-.084-.922-.247l-2.936-1.737c-.438-.245-.224-.332-.08-.383.585-.203.703-.25 1.328-.604.065-.037.151-.023.218.017l2.256 1.339c.082.045.197.045.272 0l8.795-5.076c.082-.047.134-.141.134-.238V6.921c0-.099-.053-.192-.137-.242l-8.791-5.072c-.081-.047-.189-.047-.271 0L3.075 6.68c-.085.049-.139.145-.139.241v10.15c0 .097.054.189.139.235l2.409 1.392c1.307.654 2.108-.116 2.108-.89V7.787c0-.142.114-.253.256-.253h1.115c.139 0 .255.112.255.253v10.021c0 1.745-.95 2.745-2.604 2.745-.508 0-.909 0-2.026-.551L2.28 18.675c-.57-.329-.922-.945-.922-1.604V6.921c0-.659.353-1.275.922-1.603l8.795-5.082c.557-.315 1.296-.315 1.848 0l8.794 5.082c.57.329.924.944.924 1.603v10.15c0 .659-.354 1.273-.924 1.604l-8.794 5.078c-.281.161-.6.245-.926.245zM19.099 13.993c0-1.9-1.284-2.406-3.987-2.763-2.731-.361-3.009-.548-3.009-1.187 0-.528.235-1.233 2.258-1.233 1.807 0 2.473.389 2.747 1.607.024.115.129.199.247.199h1.141c.071 0 .138-.031.186-.081.048-.054.074-.123.067-.196-.177-2.098-1.571-3.076-4.388-3.076-2.508 0-4.004 1.058-4.004 2.833 0 1.925 1.488 2.457 3.895 2.695 2.88.282 3.103.703 3.103 1.269 0 .983-.789 1.402-2.642 1.402-2.327 0-2.839-.584-3.011-1.742-.02-.124-.126-.215-.253-.215h-1.137c-.141 0-.254.112-.254.253 0 1.482.806 3.248 4.655 3.248 2.651 0 4.249-1.097 4.249-3.014z",
  linux: "M12.001 0c-3.15 0-5.4 2.376-5.4 5.76 0 1.44.45 2.925 1.125 4.05C6.9 10.8 5.4 12.6 5.4 15.3c0 2.43 1.35 4.5 3.6 5.4v.9c-1.35.45-2.25 1.35-2.25 2.4 0 .9.9 1.8 2.25 1.8 2.25 0 3.15-.9 3.15-1.8v-.9h.002c0 .9.9 1.8 3.15 1.8 1.35 0 2.25-.9 2.25-1.8 0-1.05-.9-1.95-2.25-2.4v-.9c2.25-.9 3.6-2.97 3.6-5.4 0-2.7-1.5-4.5-2.325-5.49.675-1.125 1.125-2.61 1.125-4.05 0-3.384-2.25-5.76-5.4-5.76zm-1.8 4.5c.45 0 .9.45.9.9s-.45.9-.9.9-.9-.45-.9-.9.45-.9.9-.9zm3.6 0c.45 0 .9.45.9.9s-.45.9-.9.9-.9-.45-.9-.9.45-.9.9-.9zm-1.8 2.25c.9 0 1.35.45 1.35.9 0 .45-.45.9-1.35.9-.9 0-1.35-.45-1.35-.9 0-.45.45-.9 1.35-.9z",
  github: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
  sqlite: "M11.531 0C5.165 0 0 2.222 0 4.963v14.074C0 21.778 5.165 24 11.531 24c6.365 0 11.53-2.222 11.53-4.963V4.963C23.061 2.222 17.896 0 11.531 0zm0 2.133c5.334 0 9.71 1.348 10.742 3.125-1.032 1.777-5.408 3.124-10.742 3.124S1.787 7.035.79 5.258c1.032-1.777 5.408-3.125 10.741-3.125zm0 8.534c5.334 0 9.71 1.348 10.742 3.125-1.032 1.776-5.408 3.124-10.742 3.124s-9.71-1.348-10.742-3.124c1.032-1.777 5.408-3.125 10.742-3.125zm0 8.533c5.334 0 9.71 1.348 10.742 3.125C20.574 24.092 16.198 25.44 10.864 25.44s-9.71-1.348-10.742-3.125c1.032-1.777 5.408-3.125 10.742-3.125z",
  mysql: "M16.405 5.501c-.115 0-.193.014-.274.033v.013h.014c.054.104.146.18.214.273.054.107.1.214.154.32l.014-.015c.094-.066.14-.172.14-.333-.04-.047-.046-.094-.08-.14-.04-.067-.126-.1-.18-.153zM5.77 18.695h-.927a50.854 50.854 0 00-.27-4.41h-.008l-1.41 4.41H2.45l-1.4-4.41h-.01a72.892 72.892 0 00-.195 4.41H0c.055-1.966.192-3.81.41-5.53h1.15l1.335 4.064h.008l1.347-4.064h1.095c.242 2.015.384 3.86.428 5.53zm4.017-4.08c-.378 2.045-.876 3.533-1.492 4.46-.482.716-1.01 1.073-1.583 1.073-.153 0-.34-.046-.566-.138v-.494c.11.017.24.026.386.026.268 0 .483-.075.647-.222.197-.18.295-.382.295-.605 0-.155-.077-.47-.23-.944L6.23 14.615h.91l.727 2.36c.164.536.233.91.205 1.123.4-1.064.678-2.227.835-3.483zm12.325 4.08h-2.63v-5.53h.885v4.85h1.745zm-3.32.135l-1.016-.5c.09-.076.177-.158.255-.25.433-.506.648-1.258.648-2.253 0-1.83-.718-2.746-2.155-2.746-.704 0-1.254.232-1.65.697-.43.508-.646 1.256-.646 2.245 0 .972.19 1.686.574 2.14.35.41.877.615 1.583.615.264 0 .506-.033.725-.098l1.325.772.36-.622zM15.5 17.588c-.225-.36-.337-.94-.337-1.736 0-1.393.424-2.09 1.27-2.09.443 0 .77.167.977.5.224.362.336.936.336 1.723 0 1.404-.424 2.108-1.27 2.108-.445 0-.77-.167-.978-.5zm-1.658-.425c0 .47-.172.856-.516 1.156-.344.3-.803.45-1.384.45-.543 0-1.064-.172-1.573-.515l.237-.476c.438.22.833.328 1.19.328.332 0 .593-.073.783-.22a.754.754 0 00.3-.615c0-.33-.23-.61-.648-.845-.388-.213-1.163-.657-1.163-.657-.422-.307-.632-.636-.632-1.177 0-.45.157-.81.47-1.085.315-.278.72-.415 1.22-.415.512 0 .98.136 1.4.41l-.213.476a2.726 2.726 0 00-1.064-.23c-.283 0-.502.068-.654.206a.685.685 0 00-.248.524c0 .328.234.61.666.85.393.215 1.187.67 1.187.67.433.305.648.63.648 1.168zm9.382-5.852c-.535-.014-.95.04-1.297.188-.1.04-.26.04-.274.167.055.053.063.14.11.214.08.134.218.313.346.407.14.11.28.216.427.31.26.16.555.255.81.416.145.094.293.213.44.313.073.05.12.14.214.172v-.02c-.046-.06-.06-.147-.105-.214-.067-.067-.134-.127-.2-.193a3.223 3.223 0 00-.695-.675c-.214-.146-.682-.35-.77-.595l-.013-.014c.146-.013.32-.066.46-.106.227-.06.435-.047.67-.106.106-.027.213-.06.32-.094v-.06c-.12-.12-.21-.283-.334-.395a8.867 8.867 0 00-1.104-.823c-.21-.134-.476-.22-.697-.334-.08-.04-.214-.06-.26-.127-.12-.146-.19-.34-.275-.514a17.69 17.69 0 01-.547-1.163c-.12-.262-.193-.523-.34-.763-.69-1.137-1.437-1.826-2.586-2.5-.247-.14-.543-.2-.856-.274-.167-.008-.334-.02-.5-.027-.11-.047-.216-.174-.31-.235-.38-.24-1.364-.76-1.644-.072-.18.434.267.862.422 1.082.115.153.26.328.34.5.047.116.06.235.107.356.106.294.207.622.347.897.073.14.153.287.247.413.054.073.146.107.167.227-.094.136-.1.334-.154.5-.24.757-.146 1.693.194 2.25.107.166.362.534.703.393.3-.12.234-.5.32-.835.02-.08.007-.133.048-.187v.015c.094.188.188.367.274.555.206.328.566.668.867.895.16.12.287.328.487.402v-.02h-.015c-.043-.058-.1-.086-.154-.133a3.445 3.445 0 01-.35-.4 8.76 8.76 0 01-.747-1.218c-.11-.21-.202-.436-.29-.643-.04-.08-.04-.2-.107-.24-.1.146-.247.273-.32.453-.127.288-.14.642-.188 1.01-.027.007-.014 0-.027.014-.214-.052-.287-.274-.367-.46-.2-.475-.233-1.238-.06-1.785.047-.14.247-.582.167-.716-.042-.127-.174-.2-.247-.303a2.478 2.478 0 01-.24-.427c-.16-.374-.24-.788-.414-1.162-.08-.173-.22-.354-.334-.513-.127-.18-.267-.307-.368-.52-.033-.073-.08-.194-.027-.274.014-.054.042-.075.094-.09.088-.072.335.022.422.062.247.1.455.194.662.334.094.066.195.193.315.226h.14c.214.047.455.014.655.073.355.114.675.28.962.46a5.953 5.953 0 012.085 2.286c.08.154.115.295.188.455.14.33.313.663.455.982.14.315.275.636.476.897.1.14.502.213.682.286.133.06.34.115.46.188.23.14.454.3.67.454.11.076.443.243.463.378z",
  redis: "M22.71 13.145c-1.66 2.092-3.452 4.483-7.038 4.483-3.203 0-4.397-2.825-4.48-5.12.701 1.484 2.073 2.685 4.214 2.63 4.117-.133 6.94-3.852 6.94-7.239 0-4.05-3.022-6.972-8.268-6.972-3.752 0-8.4 1.428-11.455 3.685C2.59 6.937 3.885 9.958 4.35 9.626c2.648-1.904 4.748-3.13 6.784-3.744C8.12 9.244.886 17.05 0 18.425c.1 1.261 1.66 4.648 2.424 4.648.232 0 1.577-1.127 2.378-1.916 2.102-2.052 3.842-4.137 6.924-4.137 3.018 0 4.12 2.31 4.256 4.795-.624-1.282-1.89-2.355-4.073-2.311-3.951.082-6.726 3.528-6.726 6.757 0 3.805 2.871 6.438 8.01 6.438 3.565 0 8.026-1.391 11.01-3.628 1.428-1.071-.067-4.185-.534-3.854",
  git: "M23.546 10.93L13.067.452c-.604-.603-1.582-.603-2.188 0L8.708 2.627l2.76 2.76c.645-.215 1.379-.07 1.889.441.516.515.658 1.258.438 1.9l2.658 2.66c.645-.223 1.387-.078 1.9.435.721.72.721 1.884 0 2.604-.719.719-1.881.719-2.6 0-.539-.541-.674-1.337-.404-1.996L12.86 8.955v6.525c.176.086.342.203.488.348.713.721.713 1.883 0 2.6-.719.721-1.889.721-2.609 0-.719-.719-.719-1.879 0-2.598.182-.18.387-.316.605-.406V8.835c-.217-.091-.424-.222-.6-.401-.545-.545-.676-1.342-.396-2.009L7.636 3.7.45 10.881c-.6.605-.6 1.584 0 2.189l10.48 10.477c.604.604 1.582.604 2.186 0l10.43-10.43c.605-.603.605-1.582 0-2.187",
  aes: "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 6h2v2h-2V7zm0 4h2v6h-2v-6z"
};

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 560" width="1280" height="560" role="img" aria-label="Tech arsenal: 12 production engineering tools tracked across an orbital radar HUD with real-time sweep cone and capability telemetry matrix">
  <title>Tech Arsenal — Orbital Radar HUD</title>
  <desc>Cinema-grade 360-degree tactical radar console showcasing TypeScript, Python, Docker, Kubernetes, Linux, and SQLite across three concentric orbital tiers.</desc>

  <defs>
    <style type="text/css"><![CDATA[
${archivoFont}
${jetbrainsFont}

      .arch { font-family: 'Archivo Black', -apple-system, BlinkMacSystemFont, sans-serif; font-weight: 400; }
      .mono { font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
      .sans { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }

      /* Base opacity 1 - Immune to GitHub Camo Proxy Freezing */
      .radar-base { opacity: 1; }
      .matrix-panel { opacity: 1; }
      .node { opacity: 1; }

      /* Additive 360deg Radar Sweep Beam */
      @keyframes radarSweep {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      .sweep-beam {
        transform-origin: 940px 270px;
        animation: radarSweep 6.4s linear infinite;
      }

      /* Core Holographic Flares */
      @keyframes coreGlowPulse {
        0%, 100% { transform: scale(1); opacity: 0.95; }
        50% { transform: scale(1.08); opacity: 0.75; }
      }
      .core-glow {
        transform-origin: 940px 270px;
        animation: coreGlowPulse 4s ease-in-out infinite;
      }

      /* Blip Pulses */
      @keyframes blipPulse {
        0%, 100% { r: 18px; stroke-opacity: 0.7; }
        50% { r: 21px; stroke-opacity: 0.25; }
      }
      .blip-glow {
        animation: blipPulse 3s ease-in-out infinite;
      }
      .bg-2 { animation-delay: 0.75s; }
      .bg-3 { animation-delay: 1.5s; }
      .bg-4 { animation-delay: 2.25s; }

      /* LED Indicator Blink */
      @keyframes ledBlink {
        0%, 100% { opacity: 1; filter: drop-shadow(0 0 5px currentColor); }
        50% { opacity: 0.3; filter: none; }
      }
      .led-active { animation: ledBlink 2.2s ease-in-out infinite; }

      @media (prefers-reduced-motion: reduce) {
        .sweep-beam, .core-glow, .blip-glow, .led-active {
          animation: none !important;
        }
      }
    ]]></style>

    <!-- Background Gradients -->
    <linearGradient id="bgGrad" x1="0" y1="0" x2="1280" y2="560" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#070B14"/>
      <stop offset="0.5" stop-color="#0B0F19"/>
      <stop offset="1" stop-color="#0D1527"/>
    </linearGradient>

    <pattern id="gridDots" width="24" height="24" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="0.9" fill="#94A3B8" fill-opacity="0.06"/>
    </pattern>

    <linearGradient id="cardGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0F172A"/>
      <stop offset="1" stop-color="#0A0E1A"/>
    </linearGradient>

    <!-- Radar Colors -->
    <radialGradient id="radarField" cx="940" cy="270" r="240" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#38BDF8" stop-opacity="0.18"/>
      <stop offset="0.5" stop-color="#818CF8" stop-opacity="0.07"/>
      <stop offset="1" stop-color="#0B0F19" stop-opacity="0"/>
    </radialGradient>

    <radialGradient id="coreHalo" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#7DD3FC"/>
      <stop offset="0.4" stop-color="#38BDF8" stop-opacity="0.8"/>
      <stop offset="0.8" stop-color="#818CF8" stop-opacity="0.2"/>
      <stop offset="1" stop-color="#070B14" stop-opacity="0"/>
    </radialGradient>

    <!-- Radar Sweep Gradient Wedge -->
    <linearGradient id="sweepGradient" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#38BDF8" stop-opacity="0.5"/>
      <stop offset="0.6" stop-color="#818CF8" stop-opacity="0.18"/>
      <stop offset="1" stop-color="#38BDF8" stop-opacity="0"/>
    </linearGradient>

    <!-- Cyan / Purple Accents -->
    <linearGradient id="cyanAccent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#38BDF8"/>
      <stop offset="1" stop-color="#818CF8"/>
    </linearGradient>

    <linearGradient id="purpleAccent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#C084FC"/>
      <stop offset="1" stop-color="#E879F9"/>
    </linearGradient>

    <linearGradient id="emeraldAccent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#10B981"/>
      <stop offset="1" stop-color="#34D399"/>
    </linearGradient>
  </defs>

  <!-- Background Base -->
  <rect width="1280" height="560" fill="url(#bgGrad)"/>
  <rect width="1280" height="560" fill="url(#gridDots)"/>
  <circle cx="940" cy="270" r="240" fill="url(#radarField)"/>

  <!-- Top Micro Telemetry Header -->
  <g transform="translate(48, 22)">
    <text class="mono" x="0" y="16" font-size="11" fill="#64748B" letter-spacing="2">// TECH ARSENAL // ORBITAL RADAR v4.2</text>
    
    <g transform="translate(974, 0)">
      <rect width="210" height="24" rx="12" fill="#10B981" fill-opacity="0.1" stroke="#10B981" stroke-opacity="0.4"/>
      <circle class="led-active" cx="14" cy="12" r="3.5" fill="#10B981"/>
      <text class="mono" x="25" y="15.5" font-size="9" fill="#10B981" font-weight="700" letter-spacing="1">RADAR LOCK: 12 NODES</text>
    </g>
  </g>

  <!-- ══════════════════════════════════════════════════════════════════ -->
  <!-- LEFT COLUMN (42%): TACTICAL CAPABILITY & PROFICIENCY MATRIX       -->
  <!-- ══════════════════════════════════════════════════════════════════ -->
  <g class="matrix-panel" transform="translate(48, 56)">
    <!-- Main Outer Container -->
    <rect width="494" height="434" rx="16" fill="url(#cardGrad)" stroke="#1E293B" stroke-width="1.4"/>
    <rect width="494" height="3" rx="1.5" fill="url(#cyanAccent)"/>

    <!-- Matrix Header -->
    <g transform="translate(24, 28)">
      <text class="arch" x="0" y="20" font-size="24" fill="#FFFFFF" letter-spacing="0.5">TACTICAL RADAR HUD</text>
      <text class="mono" x="0" y="42" font-size="11" fill="#38BDF8" letter-spacing="1.2">12 VERIFIED NODES &#183; 100% REPOSITORY BACKED</text>
      <text class="sans" x="0" y="62" font-size="12" fill="#94A3B8">Telemetry tracking production runtimes, automation, and secure data storage.</text>
    </g>

    <line x1="24" y1="130" x2="470" y2="130" stroke="#1E293B" stroke-width="1"/>

    <!-- Category 01: Languages & Core Systems -->
    <g transform="translate(24, 146)">
      <text class="mono" x="0" y="12" font-size="10" fill="#38BDF8" font-weight="700" letter-spacing="1.5">&#9889; 01 // LANGUAGES &amp; CORE RUNTIME</text>
      <text class="mono" x="446" y="12" text-anchor="end" font-size="9" fill="#38BDF8">94% SENSORY</text>
      
      <!-- Meter Bar -->
      <g transform="translate(0, 20)">
        <rect width="446" height="8" rx="4" fill="#060A12" stroke="#1E293B" stroke-width="1"/>
        <rect width="420" height="8" rx="4" fill="url(#cyanAccent)"/>
      </g>
      
      <text class="mono" x="0" y="44" font-size="9.5" fill="#E2E8F0">TypeScript (v5.6) &#183; Python (3.12) &#183; Node.js &#183; Bash</text>
    </g>

    <!-- Category 02: DevOps & Cloud Orchestration -->
    <g transform="translate(24, 218)">
      <text class="mono" x="0" y="12" font-size="10" fill="#C084FC" font-weight="700" letter-spacing="1.5">&#9881; 02 // CLOUD &amp; ORCHESTRATION</text>
      <text class="mono" x="446" y="12" text-anchor="end" font-size="9" fill="#C084FC">90% SENSORY</text>
      
      <!-- Meter Bar -->
      <g transform="translate(0, 20)">
        <rect width="446" height="8" rx="4" fill="#060A12" stroke="#1E293B" stroke-width="1"/>
        <rect width="401" height="8" rx="4" fill="url(#purpleAccent)"/>
      </g>
      
      <text class="mono" x="0" y="44" font-size="9.5" fill="#E2E8F0">Docker &#183; Kubernetes &#183; Linux Systems &#183; GitHub Actions</text>
    </g>

    <!-- Category 03: Data & Cryptography -->
    <g transform="translate(24, 290)">
      <text class="mono" x="0" y="12" font-size="10" fill="#10B981" font-weight="700" letter-spacing="1.5">&#128274; 03 // STORAGE &amp; CRYPTOGRAPHY</text>
      <text class="mono" x="446" y="12" text-anchor="end" font-size="9" fill="#10B981">88% SENSORY</text>
      
      <!-- Meter Bar -->
      <g transform="translate(0, 20)">
        <rect width="446" height="8" rx="4" fill="#060A12" stroke="#1E293B" stroke-width="1"/>
        <rect width="392" height="8" rx="4" fill="url(#emeraldAccent)"/>
      </g>
      
      <text class="mono" x="0" y="44" font-size="9.5" fill="#E2E8F0">SQLite &#183; MySQL &#183; AES-GCM-256 WebCrypto &#183; Redis</text>
    </g>

    <line x1="24" y1="360" x2="470" y2="360" stroke="#1E293B" stroke-width="1"/>

    <!-- Micro Readout Terminal -->
    <g transform="translate(24, 374)">
      <rect width="446" height="42" rx="8" fill="#060A12" stroke="#1E293B"/>
      <text class="mono" x="14" y="18" font-size="8.5" fill="#38BDF8">&gt; RADAR STATUS: CONTINUOUS SWEEP &#183; LATENCY: &lt;8ms</text>
      <text class="mono" x="14" y="32" font-size="8.5" fill="#10B981">&gt; 77 REPOSITORIES MONITORED &#183; ZERO DRIFT PASS &#10003;</text>
    </g>
  </g>

  <!-- ══════════════════════════════════════════════════════════════════ -->
  <!-- RIGHT COLUMN (58%): 360° ORBITAL RADAR CONSOLE                   -->
  <!-- ══════════════════════════════════════════════════════════════════ -->
  <g class="radar-base">
    
    <!-- Radar Concentric Range Rings (Centers at 940, 270) -->
    <g transform="translate(940, 270)">
      <!-- Range Ring 4 (Outer: r=225) -->
      <circle r="225" fill="none" stroke="#1E293B" stroke-width="1.4" stroke-dasharray="6 8"/>
      <!-- Range Ring 3 (Mid-Outer: r=165) -->
      <circle r="165" fill="none" stroke="#1E293B" stroke-width="1.2" stroke-dasharray="4 6"/>
      <!-- Range Ring 2 (Mid-Inner: r=110) -->
      <circle r="110" fill="none" stroke="#1E293B" stroke-width="1.2" stroke-dasharray="3 5"/>
      <!-- Range Ring 1 (Inner: r=55) -->
      <circle r="55" fill="none" stroke="#38BDF8" stroke-width="1" stroke-opacity="0.4" stroke-dasharray="2 4"/>

      <!-- Crosshairs -->
      <line x1="-240" y1="0" x2="240" y2="0" stroke="#1E293B" stroke-width="1" stroke-dasharray="4 4"/>
      <line x1="0" y1="-240" x2="0" y2="240" stroke="#1E293B" stroke-width="1" stroke-dasharray="4 4"/>

      <!-- Sub-axis angle ticks (45 deg) -->
      <line x1="-160" y1="-160" x2="160" y2="160" stroke="#1E293B" stroke-width="0.8" stroke-opacity="0.4" stroke-dasharray="3 5"/>
      <line x1="-160" y1="160" x2="160" y2="-160" stroke="#1E293B" stroke-width="0.8" stroke-opacity="0.4" stroke-dasharray="3 5"/>
    </g>

    <!-- Compass Degree Markers -->
    <text class="mono" x="940" y="38" text-anchor="middle" font-size="9" fill="#64748B" letter-spacing="1">000&#176; NORTH</text>
    <text class="mono" x="1195" y="274" font-size="9" fill="#64748B" letter-spacing="1">090&#176; EAST</text>
    <text class="mono" x="940" y="508" text-anchor="middle" font-size="9" fill="#64748B" letter-spacing="1">180&#176; SOUTH</text>
    <text class="mono" x="685" y="274" text-anchor="end" font-size="9" fill="#64748B" letter-spacing="1">270&#176; WEST</text>

    <!-- Sweeping Radar Beam (Rotating 360 degrees around 940, 270) -->
    <g class="sweep-beam">
      <!-- 45-degree gradient cone slice -->
      <path d="M 940 270 L 1099 110 A 225 225 0 0 0 940 45 Z" fill="url(#sweepGradient)"/>
      <line x1="940" y1="270" x2="940" y2="45" stroke="#38BDF8" stroke-width="1.8" stroke-linecap="round"/>
    </g>

    <!-- ── 12 PLANETARY NODES WITH SIMPLE ICONS ───────────────────── -->

    <!-- TIER 1: OUTER ORBIT (R = 215) -->
    
    <!-- 1. TypeScript (Top-Left: 764, 147) -->
    <g class="node" transform="translate(764, 147)">
      <circle class="blip-glow" r="18" fill="#0A101D" stroke="#3178C6" stroke-width="1.4"/>
      <g transform="translate(-9, -9) scale(0.75)" fill="#5AA9F0"><path d="${icons.typescript}"/></g>
      <text class="mono" x="0" y="28" text-anchor="middle" font-size="8.5" fill="#C9D1D9" font-weight="700">TypeScript</text>
    </g>

    <!-- 2. Docker (Top-Right: 1116, 147) -->
    <g class="node" transform="translate(1116, 147)">
      <circle class="blip-glow bg-2" r="18" fill="#0A101D" stroke="#2496ED" stroke-width="1.4"/>
      <g transform="translate(-9, -9) scale(0.75)" fill="#2496ED"><path d="${icons.docker}"/></g>
      <text class="mono" x="0" y="28" text-anchor="middle" font-size="8.5" fill="#C9D1D9" font-weight="700">Docker</text>
    </g>

    <!-- 3. Kubernetes (Bottom-Right: 1116, 393) -->
    <g class="node" transform="translate(1116, 393)">
      <circle class="blip-glow bg-3" r="18" fill="#0A101D" stroke="#326CE5" stroke-width="1.4"/>
      <g transform="translate(-9, -9) scale(0.75)" fill="#326CE5"><path d="${icons.kubernetes}"/></g>
      <text class="mono" x="0" y="28" text-anchor="middle" font-size="8.5" fill="#C9D1D9" font-weight="700">Kubernetes</text>
    </g>

    <!-- 4. Python (Bottom-Left: 764, 393) -->
    <g class="node" transform="translate(764, 393)">
      <circle class="blip-glow bg-4" r="18" fill="#0A101D" stroke="#3776AB" stroke-width="1.4"/>
      <g transform="translate(-9, -9) scale(0.75)" fill="#6AA9D8"><path d="${icons.python}"/></g>
      <text class="mono" x="0" y="28" text-anchor="middle" font-size="8.5" fill="#C9D1D9" font-weight="700">Python</text>
    </g>


    <!-- TIER 2: MIDDLE ORBIT (R = 155) -->

    <!-- 5. Node.js (Top: 940, 115) -->
    <g class="node" transform="translate(940, 115)">
      <circle class="blip-glow" r="16" fill="#0A101D" stroke="#339933" stroke-width="1.4"/>
      <g transform="translate(-8, -8) scale(0.68)" fill="#4FC26B"><path d="${icons.nodejs}"/></g>
      <text class="mono" x="0" y="26" text-anchor="middle" font-size="8" fill="#C9D1D9" font-weight="700">Node.js</text>
    </g>

    <!-- 6. Linux (Right: 1095, 270) -->
    <g class="node" transform="translate(1095, 270)">
      <circle class="blip-glow bg-2" r="16" fill="#0A101D" stroke="#FCC624" stroke-width="1.4"/>
      <g transform="translate(-8, -8) scale(0.68)" fill="#FCC624"><path d="${icons.linux}"/></g>
      <text class="mono" x="0" y="26" text-anchor="middle" font-size="8" fill="#C9D1D9" font-weight="700">Linux</text>
    </g>

    <!-- 7. GitHub Actions / CI (Bottom: 940, 425) -->
    <g class="node" transform="translate(940, 425)">
      <circle class="blip-glow bg-3" r="16" fill="#0A101D" stroke="#E6EDF3" stroke-width="1.4"/>
      <g transform="translate(-8, -8) scale(0.68)" fill="#E6EDF3"><path d="${icons.github}"/></g>
      <text class="mono" x="0" y="26" text-anchor="middle" font-size="8" fill="#C9D1D9" font-weight="700">GitHub CI</text>
    </g>

    <!-- 8. SQLite (Left: 785, 270) -->
    <g class="node" transform="translate(785, 270)">
      <circle class="blip-glow bg-4" r="16" fill="#0A101D" stroke="#38BDF8" stroke-width="1.4"/>
      <g transform="translate(-8, -8) scale(0.68)" fill="#38BDF8"><path d="${icons.sqlite}"/></g>
      <text class="mono" x="0" y="26" text-anchor="middle" font-size="8" fill="#C9D1D9" font-weight="700">SQLite</text>
    </g>


    <!-- TIER 3: INNER ORBIT (R = 95) -->

    <!-- 9. MySQL (Top-Right: 988, 188) -->
    <g class="node" transform="translate(988, 188)">
      <circle class="blip-glow" r="14" fill="#0A101D" stroke="#4479A1" stroke-width="1.2"/>
      <g transform="translate(-7, -7) scale(0.58)" fill="#6FA8D0"><path d="${icons.mysql}"/></g>
      <text class="mono" x="22" y="4" font-size="7.5" fill="#94A3B8">MySQL</text>
    </g>

    <!-- 10. AES-GCM-256 (Bottom-Right: 988, 352) -->
    <g class="node" transform="translate(988, 352)">
      <circle class="blip-glow bg-2" r="14" fill="#0A101D" stroke="#10B981" stroke-width="1.2"/>
      <g transform="translate(-7, -7) scale(0.58)" fill="#10B981"><path d="${icons.aes}"/></g>
      <text class="mono" x="22" y="4" font-size="7.5" fill="#10B981">AES-256</text>
    </g>

    <!-- 11. Redis (Bottom-Left: 892, 352) -->
    <g class="node" transform="translate(892, 352)">
      <circle class="blip-glow bg-3" r="14" fill="#0A101D" stroke="#FF4438" stroke-width="1.2"/>
      <g transform="translate(-7, -7) scale(0.58)" fill="#FF4438"><path d="${icons.redis}"/></g>
      <text class="mono" x="-22" y="4" text-anchor="end" font-size="7.5" fill="#94A3B8">Redis</text>
    </g>

    <!-- 12. Git Core (Top-Left: 892, 188) -->
    <g class="node" transform="translate(892, 188)">
      <circle class="blip-glow bg-4" r="14" fill="#0A101D" stroke="#F05032" stroke-width="1.2"/>
      <g transform="translate(-7, -7) scale(0.58)" fill="#F05032"><path d="${icons.git}"/></g>
      <text class="mono" x="-22" y="4" text-anchor="end" font-size="7.5" fill="#94A3B8">Git</text>
    </g>


    <!-- Central Cybernetic Core (Center: 940, 270) -->
    <g transform="translate(940, 270)">
      <!-- Outer Core Glow -->
      <circle class="core-glow" r="54" fill="url(#coreHalo)"/>
      <circle r="36" fill="#070B14" stroke="#38BDF8" stroke-width="1.8"/>
      <circle r="30" fill="#0A0F1D" stroke="#818CF8" stroke-width="1" stroke-dasharray="3 3"/>
      
      <!-- Core Initials -->
      <text class="arch" x="0" y="6" text-anchor="middle" font-size="18" fill="#FFFFFF" letter-spacing="1">SS</text>
      <text class="mono" x="0" y="19" text-anchor="middle" font-size="6.5" fill="#38BDF8" font-weight="700" letter-spacing="1">SYS.DEV</text>
    </g>

  </g>

  <!-- ══════════════════════════════════════════════════════════════════ -->
  <!-- BOTTOM TACTICAL TELEMETRY FOOTER                                 -->
  <!-- ══════════════════════════════════════════════════════════════════ -->
  <g transform="translate(48, 502)">
    <rect width="1184" height="42" rx="10" fill="#070B14" stroke="#1E293B" stroke-width="1.4"/>
    <rect width="4" height="42" rx="2" fill="url(#cyanAccent)"/>

    <text class="mono" x="20" y="25" font-size="9" fill="#94A3B8" letter-spacing="0.8">SWEEP FREQUENCY: 6.4s &#183; COORDINATES: [25.5941&#176; N, 85.1376&#176; E] BIHAR, IN</text>
    <text class="mono" x="1164" y="25" text-anchor="end" font-size="9" fill="#38BDF8" font-weight="700" letter-spacing="1">SOURCE: VERIFIED PRODUCTION COMMITS &#183; ZERO FAKE DATA</text>
  </g>

</svg>`;

fs.writeFileSync('assets/orbital-radar.svg', svg.trim() + '\n', 'utf8');
console.log('Successfully written assets/orbital-radar.svg! Size:', (Buffer.byteLength(svg) / 1024).toFixed(2), 'KB');
