# Judo technieken

Webapp waarmee judoka's van [Judoclub Banzai](http://judoclubbanzai.be) judotechnieken leren.

## Functies

- **Lijst**: zoek technieken op naam of vertaling en filter op gordel en categorie. Elke techniek heeft een detailpagina met de vertaling en een video. "Verras me" toont een willekeurige techniek.
- **Quiz**: kies een gordel en beantwoord 10 vragen over de technieken tot en met die gordel.
    - Twee soorten vragen: de juiste naam bij een afbeelding kiezen, of de juiste afbeelding bij een naam.
    - De **?**-knop legt de naam woord per woord uit (bv. o-goshi = groot-heup). Bij een fout antwoord verschijnt die uitleg automatisch.
    - De beste score per gordel wordt in de browser bewaard en als sterren getoond.

## Lokaal draaien

De app is statische HTML/JavaScript zonder build-stap. Start de meegeleverde Go-server:

```sh
cd server
go run server.go
```

en open http://localhost:9090/.

## Gegevens

- `techniques.json`: alle technieken met gordel, categorie, vertaling en video. Sorteer de sleutels na het bewerken met `./sort.sh` (vereist `jq`).
- `glossary.json`: betekenis van de afzonderlijke woorden in de namen, voor de uitleg in de quiz.
- `static/assets/img/techniques/`: afbeeldingen voor de quiz. De bestandsnaam is de sleutel uit `techniques.json`. Enkel technieken met een afbeelding komen in de quiz. Bron en licentie per afbeelding staan in `credits.json` in dezelfde map.

## Bronnen

De quizafbeeldingen komen van [Wikimedia Commons](https://commons.wikimedia.org), vooral van Michael Hultström, onder een CC BY-SA-licentie. De volledige lijst staat in de app via "Bronnen afbeeldingen".
