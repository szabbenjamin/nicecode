# nicecode
Építsünk együtt egy szép kódot!

Ez a kezdeményezés arra született, hogy szeretném ha mindannyian kicsit jobban megismernénk a javascript/typescript világát - viszont most kissé más szemszögből: használjunk typescript-et backenden!

A projekt üzenete a #shitcode2nicecode, azaz kapsz egy hulladék, rossz minőségű kódot és **teljes mértékben** szabad kezet kapsz arra hogyan írod újra. Használhatod a már meglévő ismereteidet, utánanézhetsz újszerű megvalósításoknak - a lényeg, hogy **nincs rossz megoldás!**

# A feladatról
Úgy indult a történet, hogy régóta terveztem már saját megoldást készíteni a google photos mintájára. Sok opensource megoldást kipróbáltam, egyik sem volt tökéletes. Aztán elkezdtem írni egy skiccet amit másnap megláttam és elszörnyülködtem mekkora hulladék lett kódminőséget tekintve.

Nálam a "szebb verzió" már azóta kész van, de erről a verzióról készült másolatot most elétek tárom, hogy refaktoráljátok bátran, hogy funkcióját megtartva legyen egy szép, átlátható, struktúrált kód, mely hibatűrő és nem tartalmaz ennyi programozási problémát.

Mit is vártam el a programtól?

* Futtatható legyen egy linux alapú szerveren 
* Én határozhassam meg milyen user nevében fut a backend és a frontend kiszolgálása
* Ne akkor készítsen listát a program amikor a webes felületet megnyitom, hanem előre kerüljön be adatbázisba és ami csak lehet kerüljön feldolgozásra
* Képes legyen fotót és videót kezelni, mindkettőről thumbnail-eket gyártani
* Frontenden majd lehetőségem lehessen dátum és lokáció szerint rendezni a fotókat

Mi készült el jelenleg?

A képek feldolgozásának backendje. A config.ts fájlban meghatározott helyről (rootPath) **rekurzívan** bejárja az app az összes fájlt, almappát és összeszedi a jpg és mp4 kiterjesztésű fájlokat, ezeket adatbázisba gyűjti, majd begyűjti az összes elérhető metaadatát és bélyegképeket generál.

Mi kell a futtatáshoz?

* linux
* friss nodejs
* tsc
* mariadb
* ffmpeg

Jó, valszeg működik windows-on is, de megkönnyíted a dolgod ha vm-be telepítesz egy ubuntu 18.04-et.

Mi a jutalom?

Azt mondtam, hogy nincs győztes. Nem fogjuk kihirdetni, hogy ki írta meg a legszebb kódot, ki csinálta jól vagy rosszul. Azt fogom megnézni, hogy mennyit tettél meg annak érdekében, hogy a program szebb, átláthatóbb és könnyebben karbantartható legyen. Menetközben beszélgethetünk arról, hogy jó-e az irány amerre elindultál, kérhetsz segítséget ha elakadtál. Egyedül olyan kérdésre nem fogok választ adni, hogy "ez micsoda", vagy "ez miért lett így csinálva" - mivel a feladat pont az, hogy:
* értelmezd az én vacak kódomat
* ha ismeretlen dolgot látsz benne keress rá, nézz utána, hogy mi az
* magadtól tudj úgy belenyúlni, hogy nem omlik össze - vagy ha össze is omlik tudd fixálni

Lesz jutalom: ha bemutatod a leforkolt kódodat és látom, hogy dolgoztál rajta és tanultál vele akkor vendégem vagy egy energiaitalra/csokira/ebédre/sörre/stb - te választasz.

Ha kérdésed van akkor csatlakozz az "offline" "tanulócsoportba" telegramon: https://t.me/shit2nice_code
