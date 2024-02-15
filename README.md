# SQLverine-parser

<img src="src/images/parser1.png" />

- start: `npm run start`
- build: `npm run build`

This project uses the simple JavaScript parser [peggy.js/peg.js](https://github.com/peggyjs/peggy) to parse custom SQLverine statements.

## peggy datei in js umwandeln
Um die .peggy Grammer in JS zu nutzen, muss diese erst in JS-Code umgewandelt werden:
```
npx peggy src/sqlverine.peggy > sqlverine.js
```

## Links
- [SQLverine](https://github.com/Sulkar/SQLverine)
- [peggy.js online](https://peggyjs.org/online)
