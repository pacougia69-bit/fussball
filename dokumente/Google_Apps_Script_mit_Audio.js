// =============================================
// Google Apps Script - Bilder & Audio Proxy
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

  if (audioId) {
    // Audio-Datei als Base64 zurückgeben
    return serveAudio(audioId);
  } else if (folderId) {
    // Ordner-Inhalt auflisten (bestehende Funktion)
    return listFolderContents(folderId);
  } else {
    return ContentService.createTextOutput(JSON.stringify({error: 'Missing parameter: folderId or audioId'}))
      .setMimeType(ContentService.MimeType.JSON);
  }
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
