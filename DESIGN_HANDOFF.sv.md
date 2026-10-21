# Överlämning: schemaläggning med OR-Tools (tillägg oktober 2026)

*Det här är den svenska versionen av avsnittet "Schedule generation with OR-Tools" i `DESIGN_HANDOFF.md`. Resten av det dokumentet finns bara på engelska.*

En tom vecka visar inga varningar (de skulle bara räkna upp vad som saknas). Demon börjar med ett tomt schema. Personal, avdelningar, vikarier och barndata är påhittade och finns kvar. Rektorn kan få ett förslag på schema, och det viktigaste designmålet är att **det inte får kännas som en svart låda**: den som lägger schemat (tänk en erfaren administratör, inte en programmerare) ska se vad förslaget bygger på, kunna säga vad som är annorlunda den här veckan och få en begriplig förklaring av resultatet.

## Tom vecka
När veckan på skärmen saknar pass tonas schemat ned och ett kort framför det erbjuder:
- **Skapa ett förslag åt mig**: öppnar formuläret *Skapa schema*.
- **Rita själv**: tar bort kortet för den veckan; passen ritas för hand som tidigare.
- **Kopiera vecka N−1**: visas bara när veckan före har ett schema.

Knappen **Skapa schema** i övre raden öppnar samma formulär när som helst.

## Formuläret Skapa schema (panel till höger, 600 px)
1. **Vilka veckor?** Bara den här veckan, eller 2, 4 eller 7 veckor (slutar vid demons sista vecka). Har en vecka redan pass visar formuläret vilka personer som har dem och ger två val: **Behåll dem och fyll i runt dem** (förvalt), där de personerna behåller sina pass och öppnare/stängare som redan är satta står kvar, och alla andra schemaläggs så att det som saknas täcks; eller **Börja om: ersätt hela veckan** (går att ångra). Så kan rektorn lägga några personer för hand och låta resten fyllas i.
2. **Är något annorlunda än vanligt?** En lista över särskilda dagar och frånvaro i de valda veckorna, var och en går att ta bort, och fyra knappar som öppnar ett kort formulär (vecka, knappar för veckodagar, tid eller procent ur en lista, frivillig anteckning):
   - *Personalen vill sluta tidigt*, t.ex. en konsert. Ett **önskemål**: lösaren försöker, och rapporten säger vem som inte kunde och varför.
   - *Förskolan stänger tidigt*, t.ex. dagen före en helgdag. Inga barn och ingen personal efter den tiden; stängaren arbetar till dess.
   - *Färre barn än vanligt*, t.ex. lov: ungefär 25–90 % av barnen. Färre vuxna behövs.
   - *Någon är borta*: semester, eller kurs eller annat. Sparas som ledighet på personen (Inställningar › Personal), en post per följd av dagar.
   - *Förskolan är stängd*, t.ex. en röd dag: inga barn och ingen arbetar hela dagen, och veckans avtalade timmar minskar som för en ledig dag. Röda dagar som infaller på vardagar i de valda veckorna erbjuds som knappar med ett klick (i demoperioden: julafton och juldagen). Den som har ett pass en stängd dag får en varning; ingen öppnare eller stängare behövs.
   Särskilda dagar sparas som `special: [{ id, kind: 'finishBy'|'closeEarly'|'fewer'|'closed', week, days[], time?, pct?, note }]` och visas som en ★-notering på dagen i schemat.
3. **Det här följer schemat**, hämtat från Inställningar med en länk för att ändra varje del: personal (avtalade timmar, fasta lediga dagar, vem som får öppna och stänga), barn (per avdelning: antal, barn per vuxen, öppettider, barn som behöver en utbildad vuxen), reglerna som är på, och **prioritetsordningen** när allt inte går ihop:
   1. tillräckligt många vuxna med barnen **på varje avdelning** (inte bara på förskolan som helhet), och en utbildad vuxen för barn i behov av särskilt stöd;
   2. allas avtalade timmar, över veckogränsen bara om barnen behöver det;
   3. önskemål som att sluta tidigt;
   4. planeringstid.

Knappen längst ned säger vad som kommer att hända ("Skapa schema för vecka 42–43") och ungefär hur lång tid det tar (cirka 40 sekunder per vecka; längre på en långsammare dator). Medan det pågår visar en förloppsindikator vilken vecka som görs, och schemat går inte att ändra.

## Rapporten
När schemat är klart visar panelen för varje vecka, med ✓ eller !:
- tillräckligt många vuxna hela dagarna på varje avdelning, eller tiderna då det är för få (med ett tips: en vikarie, eller ändra för hand);
- vem som hjälpte till på en annan avdelning än sin egen, och vilka dagar;
- andra regler som bryts, som under *Att kontrollera*;
- avtalade timmar: alla får sina timmar, eller vem som arbetar mer (för att barnen behövde det) och vem som får färre. Timmar över avtalet en vecka (även för deltidare) tas tillbaka veckan efter; rapporten säger vem som fick en kortare vecka för att jämna ut, och vem som inte kunde få det för att barnen behövde dem;
- den flexibla veckan: vem som arbetar lite över gränsen och hur kort nästa vecka måste bli;
- mindre planeringstid än vanligt, och för vem;
- varje särskild dag: med i schemat, eller för *sluta tidigt* hur många som slutar i tid och vilka som stannar (t.ex. "Ida Forsberg (stänger)").

**Ångra schemat** tar bort allt som gjordes, i ett steg. Om lösaren inte gick att nå hämtas veckorna från det sparade schemat; en notering säger det, och särskilda dagar står som *inte med*.

## Den flexibla veckan (regel R2)
Högst 40 timmar per vecka, eller upp till `flex` timmar till (standard 2, går att ställa till 0–4 under Inställningar › Regler) om **nästa** vecka är lika mycket kortare: 41 och sedan högst 39, 42 och sedan högst 38.
- Schemat varnar på båda veckorna om nästa vecka inte är kortare, och över 40 + `flex` som ett vanligt regelbrott.
- Lösaren går bara över när barnen annars hade haft för få vuxna. Det tröttar att gå över, så varje kvart över kostar, och dubbelt så mycket efter en extra timme.
- Veckorna görs i ordning, så en vecka efter en lång vecka får ett lägre mål och tak. En redan schemalagd nästa vecka begränsar också hur mycket en vecka får gå över.

## Så fungerar lösaren
- `solverProblem(state, weeks)` i `schedule-core-demo.js` gör om appens data till ett fristående problem per vecka. Per person: hemavdelning, får öppna/stänga, utbildad för särskilt stöd, avtalade minuter och planeringsminuter, tillgängliga dagar, tidigaste/senaste tid, veckotaket. Per dag och kvart: hur många vuxna som behövs (från samma barnprognos och barn per vuxen som schemat visar, justerat för särskilda dagar och regeln *minst antal vuxna*), stängningstiden, sluta-senast-tiden och de kvartar då en utbildad vuxen måste finnas på en avdelning. Reglerna från Inställningar som är på skickas med.
- **Inga namn, telefonnummer, orsaker till frånvaro eller anteckningar skickas.** Personer är id:n (`p1`); frånvaro är bara "inte tillgänglig den dagen".
- `solver/schedule_solver.py` (OR-Tools CP-SAT) delar varje persons dag i kvartar med barntid, rast eller planering. Måste gälla: ett sammanhängande pass på 4–9 timmar inom tillgängligheten, raster av regelns längd inne i passet (fler om regeln *raster* kräver det), högst regelns timmar utan rast, den valfria dagsgränsen, vila mellan dagar, planering i ett block på minst 30 minuter, veckotaket, en öppnare vid öppning och en stängare vid stängning (eller vid tidig stängning). Varje arbetsdag är en person på en avdelning, sin egen eller en annan; att hjälpa till någon annanstans kostar lite, så det sker bara när en avdelning annars skulle ha för få. Varje avdelnings behov (utom när avdelningarna är sammanslagna morgon och kväll) räknas lika strikt som helheten. Allt annat är en viktad kostnad, i prioritetsordningen ovan.
- Den löser först varje dag för sig med en jämn andel av veckans timmar, sedan hela veckan med det som startpunkt så att timmar kan flyttas mellan dagar; veckan behålls bara om den är bättre än dagarna tillsammans.
- Varje steg får en bestämd mängd arbete (CP-SAT:s deterministiska tid), inte ett antal sekunder, så en långsam dator når samma kvalitet och tar bara längre tid, med en generös tidsgräns som skyddsnät. Med en gräns i sekunder fick en långsam dator mycket sämre scheman.
- `solver/server.py` tar emot `POST /solve`. Sidan anropar `http://localhost:8000` (eller `?solver=…`).
- Varje resultat kontrolleras med schemats egen regelmotor i testerna (`tests/`); det sparade schemat för vecka 41–52 har inga varningar och alla får sina avtalade timmar.

## Flytta rast och planering
En rast, planering eller ett möte kan dras var som helst inom personens arbetsdag. Bara barntiden flyttar sig runt blocket; andra raster och planeringar står kvar, och dagen behåller sin början, sitt slut och sina minuter av varje slag. Släpps blocket på ett annat block hamnar det precis bredvid.

## Telefonen: knappen Jag
Mellan *Mitt schema* och *Vem arbetar* längst ned finns en rund knapp på en liten vit kulle, med en enkel personikon. Den öppnar en sida för den anställda:
- **Överst:** namn, hemavdelning, avtalade timmar i veckan och procent, och vad personen får göra (öppna, stänga, utbildad för särskilt stöd) och fasta lediga dagar eller tider.
- **Veckan** (‹ › byter vecka): schemalagda timmar av veckans mål (avtalet, minus extra timmar veckan innan), en stapel, en mening i klartext (precis enligt avtalet, X mer och nästa vecka blir lika mycket kortare, X färre, inget schema ännu), timmar per dag och fördelningen: med barnen, planering (av planeringsmålet), möte, rast.
- **Månaden:** varje vecka med timmar av målet, eller "Inget schema ännu", summan hittills och dagar sjuk, på semester eller ledig.
- **Inställningar**, sparade per person: förfrågningar om att täcka pass (avstängt betyder att personen inte tillfrågas), ändringar i mitt schema och påminnelse kvällen före. Avtal, avdelning och tider ändras av den som planerar.

## Det här gör inte demon
Det är en demo och en guide, inte en produkt:
- ingen inloggning eller roller; den som öppnar den ser allt, även orsaker till sjukfrånvaro;
- data finns bara i webbläsarens lokala lagring, och bara påhittade uppgifter hör hemma där;
- lösarens server har ingen åtkomstkontroll eller begränsningar och är tänkt att köras lokalt;
- lösaren använder fasta vikter; en riktig produkt skulle låta organisationen justera dem, och kanske lägga till önskemål per person (t.ex. att bara viss personal behöver sluta tidigt) och fasta händelser som ett personalmöte.

Se *State / backend requirements* i `DESIGN_HANDOFF.md` för vad ett riktigt system behöver.
