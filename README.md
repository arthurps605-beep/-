# Gra klasyfikacji zapasów

Edukacyjna gra w klasyfikację zapasów (inventory classification). Przeciągnij przedmioty do właściwych koszy w wybranym systemie klasyfikacji (ABC, XYZ, FSN, VED).

## Jak uruchomić

Otwórz plik `index.html` w przeglądarce (lokalnie lub przez serwer).

```bash
open index.html
# lub
python3 -m http.server 8000
# potem wejdź na http://localhost:8000
```

## Struktura projektu

- **index.html** – ekrany: start, wybór poziomu, rozgrywka, wyniki, ranking
- **style.css** – style, układ responsywny (mobile-friendly)
- **game.js** – logika gry: drag & drop, timer, punkty, ranking (localStorage)

## Zasady gry

1. **Start** – wpisz nick i kliknij „Rozpocznij”.
2. **Wybór systemu** – wybierz jeden z systemów: ABC, XYZ, FSN, VED.
3. **Rozgrywka** – w ciągu 30 sekund przeciągaj pojawiające się przedmioty do właściwych koszy (A/B/C, X/Y/Z, F/S/N lub V/E/D).
4. **Punkty** – poprawna klasyfikacja: +1, błędna: −1.
5. **Ranking** – wyniki (nick + punkty) zapisywane w przeglądarce (localStorage), wyświetlane top 10.

## Technologie

- HTML5, CSS3, JavaScript (ES5)
- jQuery + jQuery UI (drag and drop)
- jQuery UI Touch Punch (obsługa dotyku na urządzeniach mobilnych)

## Licencja

MIT (zgodnie z oryginalnym repozytorium).
# -
