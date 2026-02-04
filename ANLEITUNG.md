# Anleitung: Fußball-Webseite mit Google Drive & Sheets pflegen

---

## 1. Datei-ID in Google Drive finden

### Für eine Datei (MP3, Bild):
1. Rechtsklick auf die Datei → **"Link abrufen"**
2. Stelle sicher: **"Jeder mit dem Link"** ist ausgewählt
3. Klicke auf **"Link kopieren"**
4. Der Link sieht so aus:
   ```
   https://drive.google.com/file/d/1ABC123XYZ.../view
                                  └───────────┘
                                  Das ist die Datei-ID
   ```

### Für einen Ordner:
1. Öffne den Ordner in Google Drive
2. Schau in die Adresszeile:
   ```
   https://drive.google.com/drive/folders/1ABC123XYZ...
                                          └───────────┘
                                          Das ist die Ordner-ID
   ```

---

## 2. Bilder für Vereinsstationen hinzufügen

### In Google Drive:
1. Erstelle Ordner: `1974_1990_TUS_ROT_WEISS_SCHIEDER` (oder ähnlich)
2. Lade Bilder in den Ordner hoch
3. Rechtsklick auf Ordner → **"Freigeben"** → **"Jeder mit dem Link"**
4. Kopiere die **Ordner-ID**

### In Google Sheets (Reiter `Karriere`):

| Jahr | Verein | ... | driveordnerid |
|------|--------|-----|---------------|
| 1974–1990 | TuS Rot-Weiß Schieder | ... | `1ABC123XYZ...` |

---

## 3. Extra-Momente hinzufügen

### In Google Drive:
1. Erstelle Ordner: `Extra_2006_WM_Tour_Deutschland`
2. Lade Bilder hoch
3. Freigeben → **"Jeder mit dem Link"**
4. Kopiere die **Ordner-ID**

### In Google Sheets (Reiter `Extra`):

| titel | jahr | beschreibung | driveordnerid |
|-------|------|--------------|---------------|
| WM Tour 2006 | 2006 | Meine WM-Erlebnisse | `1ABC123XYZ...` |

---

## 4. Herzensvereine hinzufügen

### In Google Drive:
1. Erstelle Ordner: `Koeln_bilder` und `Barca_bilder`
2. Lade Bilder hoch
3. Freigeben → **"Jeder mit dem Link"**
4. Kopiere die **Ordner-IDs**

### In Google Sheets (Reiter `Herzensvereine`):

| name | driveordnerid | galleryid |
|------|---------------|-----------|
| Köln | `1ABC...` | koeln-gallery |
| Barça | `2XYZ...` | barca-gallery |

**Wichtig:** `galleryid` muss genau `koeln-gallery` oder `barca-gallery` sein!

---

## 5. Musik hinzufügen

### In Google Drive:
1. Lade MP3-Datei hoch → Freigeben → **Datei-ID** kopieren
2. Lade Cover-Bild hoch → Freigeben → **Datei-ID** kopieren

### In Google Sheets (Reiter `Musik`):

| titel | kuenstler | beschreibung | audioid | coverid | liedtext |
|-------|-----------|--------------|---------|---------|----------|
| Vereinslied | Blomberger SV | Unser Lied | `MP3-ID` | `Cover-ID` | Hier den Text schreiben... |

**Tipp für Liedtext:** Für Zeilenumbrüche in Google Sheets: **Strg + Enter**

---

## 6. Videos hinzufügen

Videos einfach in den **gleichen Ordner** wie die Bilder legen. Sie werden automatisch erkannt und als Video-Player angezeigt.

Unterstützte Formate: MP4, MOV, AVI, etc.

---

## 7. Google Apps Script (bereits eingerichtet)

Deine Web-App-URL:
```
https://script.google.com/macros/s/AKfycbwXu-T1pq5AoSv9-e3kbV6h0FbxG1x3xnzH-ME7yHCp-XwS0uaqGeBsxk8hWv8Yn1GEOA/exec
```

Falls du das Script jemals neu erstellen musst, hier ist der Code:

```javascript
function doGet(e) {
  var folderId = e.parameter.folderId;

  if (!folderId) {
    return ContentService.createTextOutput(JSON.stringify({error: 'Keine Ordner-ID angegeben'}))
      .setMimeType(ContentService.MimeType.JSON);
  }

  try {
    var folder = DriveApp.getFolderById(folderId);
    var files = folder.getFiles();
    var result = [];

    while (files.hasNext()) {
      var file = files.next();
      var mimeType = file.getMimeType();

      // Bilder und Videos
      if (mimeType.startsWith('image/') || mimeType.startsWith('video/')) {
        result.push({
          id: file.getId(),
          name: file.getName(),
          type: mimeType.startsWith('image/') ? 'image' : 'video',
          url: 'https://drive.google.com/uc?export=view&id=' + file.getId()
        });
      }
    }

    // Nach Dateinamen sortieren
    result.sort(function(a, b) {
      return a.name.localeCompare(b.name, undefined, {numeric: true});
    });

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

---

## Checkliste: Neue Inhalte hinzufügen

- [ ] Dateien/Ordner in Google Drive hochladen
- [ ] Freigabe: **"Jeder mit dem Link"** + **"Betrachter"**
- [ ] ID kopieren (aus URL)
- [ ] ID in Google Sheets eintragen
- [ ] Webseite neu laden (Strg + F5)

---

## Fehlerbehebung

| Problem | Lösung |
|---------|--------|
| Bilder werden nicht angezeigt | Ordner/Datei freigeben ("Jeder mit dem Link") |
| Musik spielt nicht | MP3-Datei freigeben |
| Änderungen nicht sichtbar | Hard-Refresh: Strg + F5 |
| Lightbox zeigt leere Bilder | Bilder einzeln freigeben |

---

## Übersicht: Google Sheets Reiter

| Reiter | Spalten |
|--------|---------|
| Karriere | jahr, verein, rolle, erfolge, beschreibung, liga, highlight, bilder, bildprefix, ordner, **driveordnerid** |
| Extra | titel, jahr, beschreibung, **driveordnerid** |
| Herzensvereine | name, **driveordnerid**, galleryid |
| Musik | titel, kuenstler, beschreibung, **audioid**, **coverid**, liedtext |
| Stats | name, wert, spruch, jahre, vereine, meistertitel, aufstiege |

---

## Kontakt & Support

Bei Fragen oder Problemen: GitHub Issues oder Claude Code

Erstellt: Februar 2025
