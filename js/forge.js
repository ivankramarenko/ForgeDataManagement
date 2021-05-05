var viewerApp;
var model;
var _viewer;
//var typeName = document.getElementById("typeName").innerHTML;
//var familyName = localStorage.getItem("familyName");

var data = "";
//console.log(familyName + "&" + typeName);
//GetTypeUrn(familyName, typeName);
//showModel(GetTypeUrn(familyName, typeName));
//getBuckets(getToken, familyName, typeName);
showModel("dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YWxsZ2VtaW5lL0FfQUxHX1RSRVBQRSZBTEdfVFJFUFBFLnJ2dA");
var bucketToken = document.getElementById("bucketToken");
console.log(getToken());
bucketToken.value = getToken();


function showModel(urn) {
    console.log("Forge action started");
    var options = {
        env: 'AutodeskProduction',
        getAccessToken: getToken,
        refreshToken: getToken
    };
    console.log(urn);

    var config3d = {
        extensions: []
      };

    urn = (urn === undefined) ? "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6ZWxlY3Ryb2luc3RhbGxhdGlvbmVuL0VfS05YX0FCWldFSUdET1NFX0RBUCZLTlhfQUJaV0VJR0RPU0UucnZ0" : urn;
    var documentId = 'urn:' + urn;
    //if (window.Autodesk === undefined) {} else {

        Autodesk.Viewing.Initializer(options, function onInitialized() {
            viewerApp = new Autodesk.Viewing.ViewingApplication('ForgeDiv');
            viewerApp.registerViewer(viewerApp.k3D, Autodesk.Viewing.Private.GuiViewer3D, config3d);
            viewerApp.loadDocument(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
        });
    //}
}

function onDocumentLoadSuccess(doc) {
    var viewables = viewerApp.bubble.search({
        'type': 'geometry'
    });
    if (viewables.length === 0) {
        console.error('Document contains no viewables.');
        return;
    }

    viewerApp.selectItem(viewables[0].data, onItemLoadSuccess, onItemLoadFail);

    //------Hide Forge Main Toolbar
    //document.getElementById('guiviewer3d-toolbar').style.visibility = 'hidden';
}

function onDocumentLoadFailure(viewerErrorCode) {
    console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode);
}

function onItemLoadSuccess(viewer, item) {
    _viewer = viewer;
    model = viewer.model;
    //viewer.toolbar.setVisible(false);
    viewer.fitToView();

    viewer.addEventListener(Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT, function () {

        var instanceTree = model.getData().instanceTree;
        var rootId = instanceTree.getRootId();
        var dbIds = getAllDbIds(rootId, instanceTree);
        getAllDbIds()
        viewer.fitToView();
    });
}

function onItemLoadFail(errorCode) {
    console.error('onItemLoadFail() - errorCode:' + errorCode);
}

function getToken() {
    var token = '';
    jQuery.ajax({
        url: "/ForgeDataManagement/server/oAuth.php",
        type: 'GET',
        async: 0,

        success: function (data) {
            var json = JSON.parse(data);
            token = json.access_token;
        }
    });
    //console.log(token);
    return token;
}

function GetTypeUrn(familyName, typeName) {

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", "/WebCatalogBrowser/xml/modelsUrn.xml", false);
    xmlhttp.send();
    var xmlDoc = xmlhttp.responseXML;
    //console.log(xmlhttp.responseXML);

    var FamilyData = xmlDoc.getElementsByTagName('FamilyData');
    for (var i = 0; i < FamilyData.length; i++) {
        //console.log(FamilyData[i].getElementsByTagName('FileName')[0].childNodes[0].nodeValue);
        //console.log(FamilyData[i].getElementsByTagName('Urn')[0].childNodes[0].nodeValue);
        console.log(familyName + "*" + typeName);
        if (FamilyData[i].getElementsByTagName('FileName')[0].childNodes[0].nodeValue === familyName + "*" + typeName + ".rvt") {
            console.log(FamilyData[i].getElementsByTagName('FileName')[0].childNodes[0].nodeValue);
            console.log(FamilyData[i].getElementsByTagName('Urn')[0].childNodes[0].nodeValue);
            return FamilyData[i].getElementsByTagName('Urn')[0].childNodes[0].nodeValue;
        }
    }
}

function getAllDbIds(rootId, tree) {

    var allDBId = [];
    var elementsNames = [];

    if (!rootId) {
        return allDBId;
    }

    var queue = [];
    queue.push(rootId);
    while (queue.length > 0) {
        var node = queue.shift();
        allDBId.push(node);
        tree.enumNodeChildren(node, function (childrenIds) {
            queue.push(childrenIds);
        });
    }

    for (var i = 0; i < allDBId.length; i++) {
        if (tree.getNodeName(allDBId[i]).includes('[')) {
            elementsNames.push(allDBId[i]);
        }

        //-----Hide Revit Level Line
        if (tree.getNodeName(allDBId[i]).includes('Level')) {
            //console.log(allDBId[i]);
            _viewer.impl.visibilityManager.setNodeOff(allDBId[i], true);
        }

        var familyName = document.getElementById("fileName").value;
        var sliceIndex = familyName.indexOf('&');
        familyName = familyName.substr(0, sliceIndex);

        var treenode = tree.getNodeName(allDBId[i]);
        treenode = ReplaceUmlaut(treenode);

        if (treenode.includes(familyName) && tree.getNodeName(allDBId[i]).includes('[')) {
            //console.log(tree.getNodeName(allDBId[i]));

            var familyName = tree.getNodeName(allDBId[i]);
            var index = familyName.indexOf("[");
            var familyIdId = familyName.substring(index + 1, familyName.length - 1);

            _viewer.search(familyIdId, SearchResult);

            function SearchResult(idArray) {
               // _viewer.fitToView(idArray);
            }
        }
    }

    return elementsNames;
}

function ReplaceUmlaut(imageName) {

    while (imageName.includes('Ø') ||
        imageName.includes('Ü') ||
        imageName.includes('Ö') ||
        imageName.includes('Ä') ||
        imageName.includes('ä') ||
        imageName.includes('ö') ||
        imageName.includes('ü') ||
        imageName.includes(' ')) {
        imageName = imageName.replace('Ø', 'D');
        imageName = imageName.replace("Ü", "UE");
        imageName = imageName.replace("Ö", "OE");
        imageName = imageName.replace("Ä", "AE");
        imageName = imageName.replace("ä", "ae");
        imageName = imageName.replace("ö", "oe");
        imageName = imageName.replace("ü", "ue");
        imageName = imageName.replace(' ', '_');
        //imageName = ReplaceUmlaut(imageName);        
    }

    return imageName;
}