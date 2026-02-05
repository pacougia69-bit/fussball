// =============================================
// Google Apps Script - Bilder, Audio & Unterordner
// =============================================
// Dieses Script in Google Apps Script einfügen:
// 1. Gehe zu: https://script.google.com
// 2. Öffne dein bestehendes Projekt
// 3. Ersetze den gesamten Code mit diesem
// 4. Klicke "Bereitstellen" > "Neue Bereitstellung"
// 5. Wähle "Web-App" und stelle sicher dass "Jeder" Zugriff hat
// 6. Kopiere die neue URL
// =============================================

function doGet(e) {
  var folderId = e.parameter.folderId;
  var audioId = e.parameter.audioId;
  var listSubfolders = e.parameter.listSubfolders;

  if (audioId) {
    // Audio-Datei als Base64 zurückgeben
    return serveAudio(audioId);
  } else if (listSubfolders && folderId) {
    // Unterordner eines Ordners auflisten
    return listSubfoldersInFolder(folderId);
  } else if (folderId) {
    // Ordner-Inhalt auflisten (bestehende Funktion)
    return listFolderContents(folderId);
  } else {
    return ContentService.createTextOutput(JSON.stringify({error: 'Missing parameter: folderId, audioId, or listSubfolders'}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// =============================================
// Unterordner eines Ordners auflisten
// =============================================
function listSubfoldersInFolder(parentFolderId) {
  try {
    var parentFolder = DriveApp.getFolderById(parentFolderId);
    var subfolders = parentFolder.getFolders();
    var result = [];

    while (subfolders.hasNext()) {
      var folder = subfolders.next();
      var folderId = folder.getId();
      var folderName = folder.getName();

      // Erstes Bild im Ordner als Vorschau holen
      var files = folder.getFiles();
      var previewImageId = null;
      var fileCount = 0;

      while (files.hasNext()) {
        var file = files.next();
        var mimeType = file.getMimeType();
        if (mimeType.startsWith('image/') || mimeType.startsWith('video/')) {
          fileCount++;
          if (!previewImageId && mimeType.startsWith('image/')) {
            previewImageId = file.getId();
          }
        }
      }

      // Ordnername parsen (Format: YYYY.MM.DD_Team1_Team2)
      var parsed = parseFolderName(folderName);

      result.push({
        id: folderId,
        name: folderName,
        date: parsed.date,
        dateFormatted: parsed.dateFormatted,
        teams: parsed.teams,
        displayName: parsed.displayName,
        previewImageId: previewImageId,
        fileCount: fileCount
      });
    }

    // Nach Datum sortieren (neueste zuerst)
    result.sort(function(a, b) {
      return b.date.localeCompare(a.date);
    });

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({error: error.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// =============================================
// Ordnername parsen
// Format: YYYY.MM.DD_Team1_Team2 oder diverse_xxx
// =============================================
function parseFolderName(folderName) {
  var result = {
    date: '',
    dateFormatted: '',
    teams: '',
    displayName: folderName
  };

  // Prüfe auf Datum-Format: YYYY.MM.DD_...
  var dateMatch = folderName.match(/^(\d{4})\.(\d{2})\.(\d{2})_(.+)$/);

  if (dateMatch) {
    var year = dateMatch[1];
    var month = dateMatch[2];
    var day = dateMatch[3];
    var rest = dateMatch[4];

    result.date = year + month + day; // Für Sortierung
    result.dateFormatted = day + '.' + month + '.' + year;

    // Teams extrahieren (Team1_Team2 oder Team1-Team2)
    var teams = rest.replace(/_/g, ' vs ').replace(/-/g, ' vs ');
    result.teams = teams;
    result.displayName = result.dateFormatted + ' — ' + teams;
  } else if (folderName.toLowerCase().startsWith('diverse')) {
    // "diverse_barca" -> "Diverse Bilder"
    result.displayName = 'Diverse Bilder';
    result.date = '00000000'; // Am Ende sortieren
  }

  return result;
}

// =============================================
// Audio-Datei laden und als Base64 zurückgeben
// =============================================
function serveAudio(fileId) {
  try {
    var file = DriveApp.getFileById(fileId);
    var blob = file.getBlob();
    var base64 = Utilities.base64Encode(blob.getBytes());
    var mimeType = blob.getContentType();

    var response = {
      success: true,
      data: base64,
      mimeType: mimeType,
      name: file.getName(),
      size: blob.getBytes().length
    };

    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message
    }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// =============================================
// Ordner-Inhalt auflisten (Bilder & Videos)
// =============================================
function listFolderContents(folderId) {
  try {
    var folder = DriveApp.getFolderById(folderId);
    var files = folder.getFiles();
    var result = [];

    while (files.hasNext()) {
      var file = files.next();
      var mimeType = file.getMimeType();

      // Nur Bilder und Videos
      if (mimeType.startsWith('image/') || mimeType.startsWith('video/')) {
        result.push({
          id: file.getId(),
          name: file.getName(),
          mimeType: mimeType,
          type: mimeType.startsWith('image/') ? 'image' : 'video',
          url: 'https://drive.google.com/uc?export=view&id=' + file.getId()
        });
      }
    }

    // Nach Name sortieren
    result.sort(function(a, b) {
      return a.name.localeCompare(b.name);
    });

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({error: error.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
