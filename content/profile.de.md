---
# Optional: Name oder Tagline für diese Sprache überschreiben. Leer lassen = Englisch verwenden.
name:
tagline:
---

<!--
  DEIN PROFIL (Deutsch). Diese Datei speist die ganze Website und das digitale Ich.
  Format: siehe content/README.md. Fehlende Einträge fallen auf die englische Version zurück.
-->

# foyer: Das Foyer | Über mich
> Du betrittst ein sanft leuchtendes Foyer. An den Wänden flackern Codefragmente, ein Berliner U-Bahn-Plan und ein altes Foto der Stadtmauer von Xi'an. Gegenüber dem Eingang hängt ein Porträt, daneben steht ein hoher Spiegel, der dich zu beobachten scheint.

Hallo, ich bin Kunxiang Shen (沈琨翔). Ich studiere Data Science (M.Sc.) an der Freien Universität Berlin und habe meinen Bachelor in Software Engineering an der Xidian University gemacht (GPA 3,8/4,0, Top 15 %). Als Praktikant bei SAP habe ich an Cloud-Tooling, CI/CD-Pipelines und Chaos Engineering gearbeitet, und in meiner Bachelorarbeit habe ich mit HSBC Technology ein LLM-Multi-Agenten-System für Compliance-Prüfungen gebaut. Ich mache aus unübersichtlichen, echten Problemen zuverlässige Software und suche Praktika und Werkstudentenstellen in AI Engineering, Data und Full-Stack-Entwicklung.

## portrait: ein Porträt | porträt, portraet, bild, gemälde
Das Porträt zeigt Kunxiang Shen. Auf einem Messingschild steht:

  Kunxiang Shen · 沈琨翔
  M.Sc. Data Science @ Freie Universität Berlin
  B.Eng. Software Engineering @ Xidian University
  Chinesisch (Muttersprache) · Englisch C1, IELTS 7.0 · Deutsch A1

In einem Satz: ein Softwareentwickler, der LLM-Systeme von der Agenten-Pipeline bis zur CI/CD-Auslieferung baut.

## mirror: ein Spiegel | spiegel
Dein Spiegelbild kräuselt sich und wird zu jemand anderem: meinem digitalen Ich. Es spricht:

„Frag mich alles: mein Studium, meine Projekte, wie ich arbeite.“

Versuch:  frag was hast du bei SAP gemacht?
<!-- game-only -->

# library: Die Bibliothek | Ausbildung
> Regale ragen in die Dunkelheit, die Bücher summen leise. Über einem Lesetisch hängt ein gerahmtes Diplom, auf dem Tisch liegt aufgeschlagen eine dicke, gebundene Abschlussarbeit. Daneben: ein Zertifikat aus Cambridge, ein Zugticket nach Paderborn und ein neues Notizbuch mit einem Berliner Bären auf dem Umschlag. Das hohe Bücherregal hat drei Fächer: Software, Systeme sowie Daten & Mathematik.

Seit 09/2026 Master in Data Science an der Freien Universität Berlin. Davor: B.Eng. Software Engineering an der Xidian University (2022–2026, GPA 3,8/4,0, Top 15 %; qualifiziert für die prüfungsfreie Zulassung zum Master und freiwillig verzichtet), ein Austauschsemester an der Universität Paderborn, gefördert vom International Office der Xidian University, und das Winterprogramm „Artificial Intelligence and Deep Learning“ der University of Cambridge (Endnote A).

## berlin: ein Berliner Notizbuch | berlin, notizbuch, fu, master
FREIE UNIVERSITÄT BERLIN · M.Sc. Data Science
09/2026 – heute
Die ersten Seiten füllen sich gerade.

## diploma: ein Diplom | diplom, abschluss, xidian, bachelor
XIDIAN UNIVERSITY · B.Eng. Software Engineering
08/2022 – 06/2026 · Xi'an, China
Schwerpunkt: Cloud Computing & Big Data
GPA 3,8 / 4,0 (Top 15 % des Studiengangs) · gewichteter Durchschnitt 86,7
Qualifiziert für die Zulassung zum Master ohne nationale Aufnahmeprüfung (保研), freiwillig darauf verzichtet.
Stipendien: zweiter Klasse (2023–2024), dritter Klasse (2022–2023)

Die Kurse stehen im Regal (untersuche bücherregal); die Abschlussarbeit liegt auf dem Tisch (untersuche abschlussarbeit).

## thesis: eine gebundene Abschlussarbeit | abschlussarbeit, bachelorarbeit, thesis, llm-txinsight
BACHELORARBEIT · „Entwurf und Implementierung eines LLM-basierten Systems zur Plausibilitätsprüfung von Bankkundentransaktionen“
Systemname: LLM-TxInsight · in Zusammenarbeit mit HSBC Technology · 12/2025 – 04/2026

DAS PROBLEM
Compliance-Analysten prüfen Kundenprofile und Transaktionshistorien von Hand. Das ist langsam, die Maßstäbe unterscheiden sich von Prüfer zu Prüfer, und unklare Transaktionen enden selten in einem eindeutigen, nachvollziehbaren Ergebnis.

WAS ICH GEBAUT HABE
Ein browserbasiertes System (Spring Boot 3 + LangChain4j, Vue 3, PostgreSQL). Man lädt ein Kundenprofil und eine Transaktionsdatei (Excel/CSV) hoch und bekommt einen dreiteiligen Bericht (Kundenüberblick, Transaktionsübersicht, Plausibilitätsurteil), exportierbar als Word-Datei.
  · Stufenweise Analyse statt eines großen Prompts. Stufe 1 sucht klar auffällige Muster (große Ausreißer, Geld rein und sofort wieder raus, Gelder vieler Personen gebündelt). Stufe 2 bewertet die Plausibilität anhand von Beruf und Einkommen. Reichen die Belege nicht, stellt Stufe 3 gezielte Rückfragen an die Analysten (bis zu 3 Runden).
  · Szenario-Skills: Regeln etwa für Überweisungen unter Verwandten, strukturierte Einlagen und Hochrisikoländer werden nur geladen, wenn ein Fall sie braucht; die Liste der Hochrisikoländer kommt aus der Datenbank statt aus dem Prompt.
  · Ein Prüf-Agent kontrolliert jedes Ergebnis; widerspricht er dem Analyse-Agenten, entscheidet ein Mensch, und die Entscheidung wird gespeichert.
  · Feedback der Analysten wird zu wiederverwendbaren Erfahrungen, auf die spätere Analysen zugreifen.
  · 171 Backend-Testmethoden (JUnit 5, Mockito, Unit- und Integrationstests) plus Frontend-Komponententests (Vitest).

EVALUATION · 500 annotierte Fälle (etwa 200 plausibel, 200 unplausibel, 100 brauchen einen Menschen)
  · Qwen-plus: einfacher Prompt 50,0 % → Few-Shot + Chain-of-Thought 60,4 % → stufenweise Orchestrierung 68,0 %
  · Bestes Ergebnis: Qwen3.6-max-preview mit Skills, 86,7 %. Qwen3-max mit Skills erreichte 83,1 % und damit mehr als die geforderten 80 %.
  · Skills bei Bedarf zu laden senkte den Token-Verbrauch modellübergreifend um etwa 20–30 %.
  · Das günstigste Modell (DeepSeek V4 Flash, etwa 0,03 ¥ pro Fall) erreichte nur 57,6 %: Die Modellwahl ist ein echter Kompromiss zwischen Genauigkeit und Kosten.

WICHTIGSTE ERKENNTNISSE
Die Aufgabe in fokussierte Stufen zu zerlegen brachte mehr Genauigkeit als Prompt-Tricks; die Kontextgröße ist ein Kostenhebel, den man gestalten kann; und einem System, das weiß, wann es einen Menschen fragen muss, vertraut man eher als einem, das immer antwortet.

## cambridge: ein Zertifikat aus Cambridge | cambridge, zertifikat, deep learning, winterprogramm
UNIVERSITY OF CAMBRIDGE · Department of Computer Science and Technology
Winterprogramm „Artificial Intelligence and Deep Learning“, 12.–24. Februar 2024
Geleitet von Prof. Nicholas D. Lane (Professor für Machine Learning Systems, Mitgründer von Flower Labs). Vorlesungen, Diskussionen und eine Gruppenpräsentation:
  1. Warum Deep Learning so dominant wurde und welche Kräfte seine weitere Entwicklung bestimmen
  2. Grundbausteine: Convolutional und Recurrent Networks, mit Code-Beispielen aus Bild- und Sprachverarbeitung
  3. Moderne Bausteine: Residual Connections, Depthwise-Separable Convolutions, Channel Shuffle und Attention
  4. Die Kunst des Trainings: wie Parameter aus statistischer Sicht gelernt werden und ein Schritt-für-Schritt-Rezept für das Training tiefer Modelle
  5. Rechenaufwand: warum Deep Learning so teuer ist und wie Systeme und Algorithmen die Kosten senken
  6. Die Forschungsfront: einflussreiche aktuelle Paper zerlegen und kritisch bewerten lernen
  7. Eine studentisch geleitete Lesegruppe, in der wir zentrale Paper selbst vorgestellt und diskutiert haben
Endnote: A.

## ticket: ein Zugticket nach Paderborn | ticket, zugticket, paderborn, austausch
UNIVERSITÄT PADERBORN · Austauschstudent, 09/2024 – 03/2025
Gefördert vom International Office der Xidian University (国合部).
Kurse: Rechnernetze, grundlegende Algorithmen und Deutsch (A1).
Mein erstes Semester in Deutschland.

## bookshelf: ein Bücherregal | bücherregal, regal, bücher, kurse
Ein hohes Regal mit drei Fächern voller Fachkurse, die mich geprägt haben:
  · Software-Fach ········ Programmierung, Datenstrukturen, Algorithmen, Architektur
  · System-Fach ·········· Schaltungen, Rechnerarchitektur, Betriebssysteme, Cloud, Sicherheit
  · Daten-&-Mathe-Fach ··· Statistik, Numerik, maschinelles Lernen, Information Retrieval
Versuch:  untersuche software-fach

## shelf-software: das Software-Fach | software-fach, software, programmierung
  · Einführung in Informatik & Programmierung: richtig programmieren lernen: Kontrollfluss, Funktionen, Arrays, Zeiger und Speicher
  · Python-Programmierung: idiomatisches Python und die Standardbibliothek
  · Objektorientierte Programmierung: Klassen, Vererbung und Polymorphie; Code um Objekte herum organisieren
  · Datenstrukturen: Listen, Stacks, Queues, Bäume, Graphen und Hashtabellen, dazu Sortieren und Suchen
  · Entwurf und Analyse von Algorithmen: Divide and Conquer, dynamische Programmierung, Greedy, Backtracking, Komplexitätsanalyse
  · Softwarearchitektur: Architekturstile, Qualitätsmerkmale und Entwurfsmuster und wie man zwischen ihnen wählt
  · Softwareprozess & Projektmanagement: vom Wasserfall zu agilen Methoden, Schätzen, Planen, Risiken und Versionen managen
  · Geistiges Eigentum & Softwareschutz: Urheberrecht, Patente und Open-Source-Lizenzen für Software

## shelf-systems: das System-Fach | system-fach, systeme, hardware
  · Schaltungen & Elektronik, Digitaltechnik: von Logikgattern zu kombinatorischen und sequentiellen Schaltungen
  · Rechnerorganisation & -architektur: Befehlssätze, Datenpfad, Speicherhierarchie und Caches, mit Kursprojekt
  · Betriebssysteme: Prozesse und Threads, Scheduling, Synchronisation, Speicherverwaltung und Dateisysteme, mit Kursprojekt
  · Cloud Computing: Virtualisierung, Container, verteilte Speicherung und Berechnung
  · Ingenieurpraktikum Cloud & Big Data: ein praktisches Teamprojekt in meinem Schwerpunkt
  · Einführung in die Informationssicherheit: Kryptografie-Grundlagen, Authentifizierung, Zugriffskontrolle, typische Angriffe und Abwehr

## shelf-data: das Daten-&-Mathe-Fach | daten-fach, mathe-fach, daten, mathe, ki
  · Diskrete Mathematik: Logik, Mengen, Relationen, Graphen und Kombinatorik
  · Wahrscheinlichkeit & Statistik: Verteilungen, Schätzen und Hypothesentests
  · Numerische Analysis: Gleitkommafehler, Interpolation, numerische Integration und iterative Verfahren für Gleichungen
  · Maschinelles Lernen & Data Mining: Regression, Klassifikation, Clustering, Modellbewertung und Assoziationsregeln
  · Information Retrieval: invertierte Indizes, TF-IDF und Vektorraum-Ranking, Precision und Recall; die Ideen hinter heutigem RAG
  · Algorithmen der Bioinformatik: Sequenz-Alignment mit dynamischer Programmierung

# workshop: Die Werkstatt | Projekte & Fähigkeiten
> Funken und Lötrauch. Auf der Werkbank zeigt ein Bildschirm, wie ein KI-Agent über eine Banktransaktion nachdenkt; daneben steht ein Terminal, das diesem hier verdächtig ähnlich sieht. Auf dem Boden steht ein abgenutzter Werkzeugkasten offen.

Ich baue LLM-Anwendungen von Anfang bis Ende: Agenten-Orchestrierung mit LangChain4j und Spring Boot, Frontends mit Vue 3 + TypeScript und die Docker/Kubernetes/Jenkins-Infrastruktur, die alles am Laufen hält.

## agent: der Compliance-Agent | agent, bank, hsbc, geldwäsche, prototyp a, a
PROJEKT · System zur Plausibilitätsprüfung von Banktransaktionen
Mit HSBC Technology · 12/2025 – 04/2026 · meine Bachelorarbeit
Was: ein intelligenter Assistent für Geldwäscheprävention und Compliance-Prüfungen. Er bekommt ein Kundenprofil und die Transaktionshistorie; LLM-Agenten bewerten jede Transaktion und liefern Urteil, Begründung und Belege. Unsichere Hochrisikofälle gehen an einen Menschen.
Was ich gebaut habe:
  · Das komplette Backend mit LangChain4j + Spring Boot 3, inklusive persistentem Chat-Gedächtnis für Rückfragen
  · Multi-Agenten-Pipeline: Erkennung → Prüfung → Rückfrage an einen Menschen → finales Urteil; bei geringer Sicherheit automatische Eskalation (Human-in-the-Loop)
  · Eine erweiterbare Skill-Bibliothek: jede Prüfregel ist ein Skill (Regel + Parameter + Referenzwissen), der per Regel-Vorauswahl + semantischem Matching bei Bedarf geladen wird, RAG-artig
  · Function Calling, damit das Modell selbst entscheidet, welche Skills es aktiviert
  · Ein Feedback-Kreislauf: Korrekturen der Nutzer werden zu wiederverwendbaren Erfahrungen, auf die spätere Analysen zugreifen
  · Mehrstufige Chain-of-Thought-Prompts mit Anti-Halluzinations-Regeln, versioniert und iterativ verbessert
  · Frontend mit Vue 3 + TypeScript + Tailwind CSS 4

## terminal-site: ein verdächtig vertrautes Terminal | terminal, website, diese seite, prototyp b, b
PROJEKT · Diese Website
Ein Textadventure-Portfolio, in dem du gerade stehst: ein Three.js-Partikel-Intro (rund 140.000 Sandkörner, per Shader gerendert), ein Befehlsparser in drei Sprachen, eine Pixel-Art-Karte und ein „frag“-Befehl, hinter dem ein LLM steckt, das aus genau diesem Profil antwortet.
Gebaut zusammen mit Claude, was gut zum Thema passt: im Serverarchiv siehst du, wie ich KI nutze.
Code: https://github.com/KeloShen/keloshen.github.io

## toolbox: ein Werkzeugkasten | werkzeugkasten, werkzeug, fähigkeiten
Ordentlich sortierte Fächer:
  Backend      · Java 21 + Spring Boot 3, Python, C++, PostgreSQL
  Frontend     · Vue 3 + TypeScript, Quasar, Tailwind CSS
  KI           · LangChain4j, LLM-Agenten, Function Calling, RAG, Prompt Engineering
  DevOps       · Jenkins CI/CD, Docker, Kubernetes, Helm, Linux, Shell
  Zuverlässigk.· Chaos Engineering (Chaos Mesh), Prometheus + Grafana
  Workflow     · Git (Gerrit, GitHub), Jira, n8n
  Sprachen     · Chinesisch (Muttersprache), Englisch C1 (IELTS 7.0), Deutsch A1

# office: Das Büro | Berufserfahrung
> Ein aufgeräumter Schreibtisch im Licht zweier Monitore. Auf dem einen läuft eine Jenkins-Pipeline grün durch, auf dem anderen zuckt ein Grafana-Dashboard, während jemand Chaos in einen Cluster injiziert. An der Lampe hängt ein Schlüsselband mit SAP-Ausweis.

Praktikant im Software Engineering bei SAP (HANA Cloud Delivery, Xi'an, 04–10/2025): Frontend-Tooling für Cloud-Management, Jenkins CI/CD, Kubernetes/Helm-Deployments und Chaos Engineering. Ausgezeichnet mit dem SAP Peer-to-Peer Award.

## badge: ein SAP-Ausweis | ausweis, sap, praktikum
SAP · HANA Cloud Delivery · Praktikant · Xi'an, 04/2025 – 10/2025
  · Mitentwicklung eines Frontend-Tools (Vue 3, TypeScript, Quasar) für das Management von Cloud-Services
  · Wartung und Optimierung einer Jenkins-CI/CD-Pipeline: Sicherheitschecks, Docker-Images, Deployment
  · Automatisierte Zugriffe auf HANA-Datenbanken mit Python; Deployments mit Kubernetes und Helm
  · Chaos-Engineering-Experimente mit Chaos Mesh, Monitoring mit Grafana + Prometheus
  · Agile Arbeit mit Jira und Automatisierung der Team-Benachrichtigungen

## award: ein kleiner Glaspokal | pokal, auszeichnung, preis
Eingraviert, der Reihe nach:
  · SAP Peer-to-Peer Award für Zusammenarbeit und Innovation (10/2025)
  · Nationaler dritter Preis, National College English Competition (05/2024)
  · Stipendium zweiter Klasse der Xidian University (2023–2024)
  · Stipendium dritter Klasse der Xidian University (2022–2023)

# playroom: Das Spielzimmer | Hobbys
> Ein gemütliches, etwas chaotisches Zimmer. Aus einer Schublade ragt ein altes Mikrocontroller-Board mit Steckkabeln, und auf der Fensterbank zeigt ein verstaubter Laptop noch einen Blog von 2023.

## mcu: ein altes Mikrocontroller-Board | board, mikrocontroller, 51
Ein 8051-Entwicklungsboard, dem früher oder später fast jeder chinesische Ingenieurstudent begegnet. 2023 habe ich in meinem alten Blog darüber geschrieben, wie ich es gelernt habe.

## blog: ein verstaubter Blog | blog, laptop, hexo
Mein erster Blog, im Januar 2023 mit Hexo gebaut. Beiträge über das Einrichten, Suchmaschinen-Tricks und den 51-Mikrocontroller. Er lag genau unter dieser Adresse; 2026 hat ihn dieses digitale Leben ersetzt.

# archive: Das Serverarchiv | KI-Reise
> Kalte Luft und blinkende Lichter. In den Serverschränken liegt jedes Gespräch mit KI, das es wert war, aufgehoben zu werden. In der Mitte leuchtet ein Terminal, daneben liegen eine ausgedruckte Zusammenfassung und ein Stapel Logdateien.

Ich nutze KI-Tools jeden Tag zum Programmieren, Debuggen und Lernen: Claude Code, Codex, Cursor, Cline und OpenClaw, dazu n8n für Automatisierung. Ich behandle sie wie einen Sparringspartner: Probleme zerlegen, nachfragen und die Antworten überprüfen.

## terminal: ein Terminal | terminal, bildschirm
<!-- ai: stats -->

## summary: eine ausgedruckte Zusammenfassung | zusammenfassung, ausdruck
<!-- ai: learned -->

## logs: Logdateien | logdateien, logs, dateien
<!-- ai: recent -->
