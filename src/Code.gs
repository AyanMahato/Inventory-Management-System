/** @OnlyCurrentDoc */

function onOpen() {
  // Your entire script code goes here
  var sheet1 = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var sheet2 = SpreadsheetApp.getActiveSpreadsheet().getSheets()[1];
  if (sheet1.getDataRange().getValues()[0][0] != "Item ID") {
    var newItem1 = ["Item ID", "Item Name", "Quantity", "Reborrow", "Status"];
    sheet1.appendRow(newItem1);
  }
  sheet1.getRange(1, 1, 1, sheet1.getLastColumn()).setFontWeight("bold");
  if (sheet2.getDataRange().getValues()[0][0] != "Entry ID") {
    var newItem2 = [
      "Entry ID",
      "Item ID",
      "Item Name",
      "Employee ID",
      "Quantity",
      "Transaction",
      "Date & Time",
    ];
    sheet2.appendRow(newItem2);
  }
  sheet2.getRange(1, 1, 1, sheet2.getLastColumn()).setFontWeight("bold");
  uifunc();
}
//UI function
function uifunc() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu("Storage")
    .addItem("Add Item", "addItem")
    .addItem("Update Details", "updateDetails")
    .addItem("Delete Item", "deleteItem")
    .addItem("Clear Storage Data", "clearData")
    .addToUi();
  ui.createMenu("Transactions")
    .addItem("Add Entry", "addEntry")
    .addItem("Edit Entry", "updateQuantity")
    .addItem("Delete Entry", "deleteEntry")
    .addItem("Clear Transactions", "clearData")
    .addToUi();
}

//storage
// Function to add a new item to the inventory
function addItem() {
  var sheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();
  var sheet01 = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(
    sheets[0].getName()
  );
  SpreadsheetApp.getActiveSpreadsheet().setActiveSheet(sheet01);

  var template = HtmlService.createTemplateFromFile("SAddItem");
  var htmlOutput = template.evaluate().setWidth(300).setHeight(350);
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, "Add Item");
}
function processFormDataStorage(itemID, itemName, quantity, rborrow, status) {
  // Use the inputs in your Apps Script code
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var data = sheet.getDataRange().getValues();
  var ind = 0;
  for (var i = 0; i < data.length; i++) {
    if (data[i][0] == itemID) {
      data[i][2] = data[i][2] + quantity;
      ind = 1;
      break;
    }
  }
  if (ind == 0) {
    var newItem = [itemID, itemName, quantity, rborrow, status];
    sheet.appendRow(newItem);
  }
}

// Function to update the quantity of an existing item
function updateDetails() {
  var sheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();
  var sheet01 = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(
    sheets[0].getName()
  );
  SpreadsheetApp.getActiveSpreadsheet().setActiveSheet(sheet01);
  var itemID = Browser.inputBox("Enter Item ID to Update");
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var ind = 0;
  var data = sheet.getDataRange().getValues();
  for (var i = 0; i < data.length; i++) {
    if (data[i][0] == itemID) {
      var template = HtmlService.createTemplateFromFile("SUpdateItem");
      template.itemID = itemID;
      template.itemNam = data[i][1];
      template.itemQuantity = data[i][2];
      template.itemReborrow = data[i][3];
      template.itemStatus = data[i][4];
      var htmlOutput = template.evaluate().setWidth(400).setHeight(400);
      SpreadsheetApp.getUi().showModalDialog(htmlOutput, "Update Item");
      ind = 1;
      break;
    }
  }
  if (ind == 0) {
    Browser.msgBox("Item Not Found");
  }
}
function updateFormDataStorage(itemID, itemName, quantity, rborrow, status) {
  // Use the inputs in your Apps Script code
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var datarange = sheet.getDataRange();
  var data = datarange.getValues();
  for (var i = 0; i < data.length; i++) {
    if (data[i][0] == itemID) {
      if (itemName != "") data[i][1] = itemName;
      if (quantity != "") data[i][2] = quantity;
      if (rborrow != "") data[i][3] = rborrow;
      if (status != "") data[i][4] = status;
      break;
    }
  }
  sheet.getDataRange().clear();
  datarange.setValues(data);
  sheet.getRange(1, 1, 1, sheet.getLastColumn()).setFontWeight("bold");
}

//function to delete entry
function deleteItem() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var itemID = Browser.inputBox("Enter Item ID to Delete");
  var data = sheet.getDataRange().getValues();
  for (var i = 0; i < data.length; i++) {
    if (data[i][0] == itemID) {
      sheet.deleteRow(i + 1);
      break;
    }
  }
}

//transactions
// Function to add a new entry to the transaction
function addEntry() {
  var template = HtmlService.createTemplateFromFile("TAddEntry");
  var htmlOutput = template.evaluate().setWidth(400).setHeight(350);
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, "Add Entry");
}
function processFormDataTransactions(itemID, itemName, empId, quantity, trans) {
  var sourceSheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var datarange = sourceSheet.getDataRange();
  var data = datarange.getValues();
  var tSheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[1];
  var tdatarange = tSheet.getDataRange();
  var tdata = tdatarange.getValues();
  var ind = 0;
  var tdate = new Date();
  for (var i = 0; i < tdata.length; i++) {
    if (
      tdata[i][3] == empId &&
      tdata[i][5] == "Borrow" &&
      tdata[i][1] == itemID &&
      trans == "Borrow"
    ) {
      var bdate = tdata[i][6];
      var diff = Math.round(
        (tdate.getTime() - bdate.getTime()) / (1000 * 3600 * 24)
      );
      var rborrow = "";
      for (var i = 0; i < data.length; i++) {
        if (data[i][0] == itemID) {
          rborrow = parseInt(data[i][3]);
          break;
        }
      }
      if (diff <= rborrow) {
        Browser.msgBox(
          "Employee cannot borrow this item before " +
            (rborrow - diff) +
            " Days"
        );
        ind = 1;
      }
      break;
    }
  }
  if (ind == 0) {
    for (var i = 0; i < data.length; i++) {
      if (data[i][0] == itemID) {
        var c = 0;
        if (trans == "Borrow") {
          data[i][2] = parseInt(data[i][2]) - parseInt(quantity);
        } else {
          if (data[i][4] == "NR") {
            Browser.msgBox("Item is Non Returnable");
            c = 1;
          } else {
            data[i][2] = parseInt(data[i][2]) + parseInt(quantity);
          }
        }
        break;
      }
    }
    if (c == 0) {
      var tID =
        tdatarange.getLastRow() == 1
          ? 1
          : tdata[tdatarange.getLastRow() - 1][0] + 1;
      var newItem = [tID, itemID, itemName, empId, quantity, trans, tdate]; // Replace with actual item data
      tSheet.appendRow(newItem);
      sourceSheet.getDataRange().clear();
      datarange.setValues(data);
      sourceSheet
        .getRange(1, 1, 1, sourceSheet.getLastColumn())
        .setFontWeight("bold");
    }
  }
}

// Function to update the quantity of an existing item
function updateQuantity() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[1];
  var entryID = Browser.inputBox("Enter Entry ID to Update");
  var ind = 0;
  var data = sheet.getDataRange().getValues();
  for (var i = 0; i < data.length; i++) {
    if (data[i][0] == entryID) {
      var template = HtmlService.createTemplateFromFile("TUpdateEntry");
      template.entryID = entryID;
      template.itemID = data[i][1];
      template.itemNam = data[i][2];
      template.empID = data[i][3];
      template.quantity = data[i][4];
      template.transaction = data[i][5];
      var htmlOutput = template.evaluate().setWidth(500).setHeight(400);
      SpreadsheetApp.getUi().showModalDialog(htmlOutput, "Update Entry");
      ind = 1;
      break;
    }
  }
  if (ind == 0) {
    Browser.msgBox("Entry Not Found");
  }
}
function updateFormDataTransactions(itemID, itemName, empId, quantity, trans) {
  // Use the inputs in your Apps Script code
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[1];
  var datarange = sheet.getDataRange();
  var data = datarange.getValues();
  for (var i = 0; i < data.length; i++) {
    if (data[i][1] == itemID) {
      if (itemName != "") data[i][2] = itemName;
      if (empId != "") data[i][3] = empId;
      if (quantity != "") data[i][4] = quantity;
      if (trans != "") data[i][5] = trans;
      data[i][6] = new Date();
      break;
    }
  }
  sheet.getDataRange().clear();
  datarange.setValues(data);
  sheet.getRange(1, 1, 1, sheet.getLastColumn()).setFontWeight("bold");
}

//delete entry
function deleteEntry() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[1];
  var itemID = Browser.inputBox("Enter Entry ID to Delete");
  var data = sheet.getDataRange().getValues();
  for (var i = 0; i < data.length; i++) {
    if (data[i][0] == itemID) {
      sheet.deleteRow(i + 1);
      break;
    }
  }
}

//common functions
//function to clear sheet
function clearData() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  // Clear the entire sheet
  var dataRange = sheet.getRange(
    2,
    1,
    sheet.getLastRow() - 1,
    sheet.getLastColumn()
  );
  dataRange.clearContent();
}
