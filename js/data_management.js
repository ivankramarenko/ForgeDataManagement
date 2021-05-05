var ListFamilyData = [];
var buttonGet = document.getElementById("btnGetBuckets");
var contextBucket = undefined;
var contextFile = undefined;
var token = getToken();
var uploadFileArray;
var uploadIterator = 0;
var bucketUpload;
var tokenUpload;
var selectedBucket;
var isFileClicked = false;
getBuckets(token, false);

buttonGet.onclick = function () {
    getBuckets(token, true);
}

var btnDeleteBucket = document.getElementById("btnDeleteBucket");
btnDeleteBucket.onclick = function () {
    //deleteBucket();
}

var btnXML = document.getElementById("btnXML");
btnXML.onclick = function () {
    GetXMLdata();
}

var submitFileLoad = document.getElementById("submitFile");
submitFileLoad.onchange = function () {
    //submitFileLoad.form.submit();

    bucketUpload = document.getElementById("bucketKey").value;
    tokenUpload = document.getElementById("inputToken").value;
    uploadFileArray = submitFileLoad.files;
    uploadIterator = 0;
    uploadFileAsync();

}

function uploadFileAsync() {
    if (uploadFileArray.length <= uploadIterator) {
        console.log("UPLOAD FINISHED");
        clearBucketMarkup(contextBucket);
        getFiles(contextBucket.dataset.bucketkey, contextBucket);
        return;
    }
    var formData = new FormData();
    console.log(uploadFileArray[uploadIterator].name);
    formData.append("files", uploadFileArray[uploadIterator]);
    formData.append("bucketKey", bucketUpload);
    formData.append("inputToken", tokenUpload);

    $.ajax({
        url: '/ForgeDataManagement/server/UploadFile.php',
        method: 'POST',
        type: 'POST',
        data: formData,
        contentType: false,
        processData: false,
        success: function (response) {
            uploadIterator++;
            console.log(response);
            //var parsedResponse = JSON.parse(response);
            //console.log(parsedResponse);
            //console.log(uploadIterator + " " + parsedResponse.result);
            uploadFileAsync();
        },
        error: function (response) {
            console.log(response);
            uploadIterator++;
            uploadFileAsync();
        }
    });
}

var counterLoad = 0;
var totalBuckets = 0;

function getBuckets(bearer, getAllFiles) {

    console.log("-----Get Buckets-----");

    var progressDiv = document.getElementById("progress");
    progressDiv.style.height = "24px";
    $.post("/ForgeDataManagement/server/Buckets.php", {
        token: bearer
    }, function (result) {
        var json = JSON.parse(result);
        var tree = document.getElementById("tree");
        tree.innerHTML = "";
        totalBuckets = json.items.length;
        for (i = 0; i < json.items.length; i++) {
            var image = document.createElement("img");
            image.className = "tree-bucket-image";
            image.src = "/ForgeDataManagement/images/folder-icon.png";
            var bucketDiv = document.createElement("div");
            bucketDiv.className = "treeBucket";
            bucketDiv.setAttribute("data-bucketKey", json.items[i].bucketKey);
            bucketDiv.setAttribute("data-bucketPolicy", json.items[i].policyKey);

            var bucketName = document.createTextNode(json.items[i].bucketKey);
            var bucketNumber = document.createTextNode(i + 1 + ". ");

            bucketDiv.appendChild(image);
            bucketDiv.appendChild(bucketNumber);
            bucketDiv.appendChild(bucketName);
            bucketDiv.oncontextmenu = function () {
                if (isFileClicked == false) {
                    btnDeleteFile.style.display = "none";
                }
                isFileClicked = false;
                contextBucket = this;
                var inputBucket = document.getElementById("bucketKey");
                inputBucket.value = contextBucket.getAttribute("data-bucketKey");

                var inputToken = document.getElementById("inputToken");
                inputToken.value = getToken();
                showContextMenu(event);
            }

            bucketDiv.onclick = function () {
                contextBucket = this;
                var bucketKey = contextBucket.getAttribute("data-bucketKey");
                selectedBucket = bucketKey;
                if (contextBucket.children.length <= 1) {
                    getFiles(bucketKey, contextBucket);
                }
            }
            tree.appendChild(bucketDiv);

            if (getAllFiles === true) {
                var bucketfiles = getFiles(json.items[i].bucketKey, bucketDiv);
            }
        }
    });
}

function GetXMLdata() {
    var listFiles = document.getElementsByClassName("treeFile");

    var doc = document.implementation.createDocument("", "", null);
    var ArrayOfFamilyData = [];

    for (var i = 0; i < listFiles.length; i++) {
        var FamilyData = [];
        var name = listFiles[i].dataset.name;
        name = name.replace("&", "$");
        name = name.replace("Ä", "AE");
        name = name.replace("Ü", "UE");
        name = name.replace("Ö", "OE");
        name = name.replace("ä", "ae");
        name = name.replace("ö", "oe");
        name = name.replace("ü", "ue");

        FamilyData.push(name, listFiles[i].dataset.base64);

        ArrayOfFamilyData.push(FamilyData);
    }

    var array = JSON.stringify(ArrayOfFamilyData);
    console.log(array);
    $.post('/ForgeDataManagement/server/CreateXML.php', {
        content: array
    }, function (result) {
        //window.open("xml/modelUrn.xml");
        var getButton = document.getElementById("btnDownload");
        getButton.click();
    });
}

function showContextMenu(event) {
    var menu = document.getElementById("context-menu");
    menu.style.visibility = "visible";
    menu.style.position = "absolute";
    menu.style.left = event.clientX + "px";
    menu.style.top = event.clientY + "px";
    menu.style.zIndex = "10";
    window.event.returnValue = false;
}

function getFiles(bucketName, divBucket) {
    $.post("/ForgeDataManagement/server/AutodeskFiles.php", {
        token: getToken(),
        bucket: bucketName
    }, function (result) {
        //console.log(result);
        var json = JSON.parse(result);
        var progress = document.getElementById("progressBarValue");
        var progressBackground = document.getElementById("progressBarBackground");
        counterLoad++;
        progress.innerText = Math.ceil((counterLoad / totalBuckets) * 100) + "%";
        if (progress.innerText === "100%") {

            var progressDiv = document.getElementById("progress");
            progressDiv.style.height = "0px";
            progressDiv.style.visibility = "hidden";
        }
        progressBackground.style.width = Math.ceil((counterLoad / totalBuckets) * 100) + "%";
        var counter = 0;

        console.log(json.items);
        json.items.sort(function (a, b) {
            return a.objectKey.localeCompare(b.objectKey);
        });

        for (i = 0; i < json.items.length; i++) {
            counter++;
            var divFile = document.createElement("div");
            divFile.className = "treeFile";
            divFile.oncontextmenu = function () {
                isFileClicked = true;
                btnDeleteFile.style.display = "block";
                clearTreeFileContext();
                //console.log(this);
                contextFile = this;
                this.style.background = "#315684";
                this.style.color = "white";
                this.style.boxShadow = "2px 2px 8px 2px #888"
            }
            divFile.dataset.urn = json.items[i].objectId;
            divFile.dataset.name = json.items[i].objectKey;
            divFileName = document.createTextNode(counter + ". " + json.items[i].objectKey);

            var image = document.createElement("img");
            image.src = "/ForgeDataManagement/images/file-icon.jpg";
            image.className = "tree-file-image";

            divFile.appendChild(image);
            divFile.appendChild(divFileName);
            getBase64(divFile.dataset.urn, divFile);

            divFile.onclick = function () {
                var fileName = document.getElementById("fileName");
                fileName.value = this.dataset.name;
                var fileUrn = document.getElementById("fileUrn");
                fileUrn.value = this.dataset.base64;
                showModel(this.dataset.base64);
            }
            divBucket.appendChild(divFile);
        }
    });
}

function getBase64(urn, filediv) {

    $.post("/ForgeDataManagement/server/Base64encoder.php", {
        sourceURN: urn
    }, function (result) {
        filediv.dataset.base64 = result;
    });
}

function deleteBucket() {
    console.log(contextBucket.getAttribute("data-bucketKey"));
    $.post("/ForgeDataManagement/server/DeleteBucket.php", {
        bucketKey: contextBucket.getAttribute("data-bucketkey"),
        token: getToken()
    }, function (result) {
        console.log(result);
        var menu = document.getElementById("context-menu");
        menu.style.visibility = "hidden";
        getBuckets(token);
    });
}

function uploadFile(fileName) {
    console.log(fileName);

    $.post("/ForgeDataManagement/server/UploadFile.php", {
        bucketKey: contextBucket.getAttribute("bucketkey"),
        fileName: fileName,
        token: getToken()
    }, function (result) {
        console.log(result);
    });
}

function closeContextMenu(event) {
    var menu = document.getElementById("context-menu");
    if (menu.style.visibility === "visible") {
        if (event.button === 0) {
            if (event.clientX < parseInt(menu.style.left, 10) ||
                event.clientX > (parseInt(menu.style.left, 10) + menu.offsetWidth) ||
                event.clientY < parseInt(menu.style.top, 10) ||
                event.clientY > (parseInt(menu.style.top, 10) + menu.offsetHeight)) {
                menu.style.visibility = "hidden";
                clearTreeFileContext();
                btnDeleteFile.style.display = "none";
            }
        }
    }
}

var submitFileContext = document.getElementById("submitFile");
submitFile.onclick = function () {
    console.log("Upload started");
    var menu = document.getElementById("context-menu");
    if (menu.style.visibility === "visible") {
        menu.style.visibility = "hidden";
    }
}

var btnDeleteFile = document.getElementById("btnDeleteFile");
btnDeleteFile.onclick = function () {

    var bucketKey = contextBucket.dataset.bucketkey;
    var objectName = contextFile.dataset.name;

    $.post("/ForgeDataManagement/server/DeleteFile.php", {
        bucketKey: bucketKey,
        objectKey: objectName,
        token: getToken()
    }, function (result) {
        console.log(result);
        var menu = document.getElementById("context-menu");
        menu.style.visibility = "hidden";
        //getBuckets(token);
        clearBucketMarkup(contextBucket);
        getFiles(contextBucket.dataset.bucketkey, contextBucket);
    });
}

function clearTreeFileContext() {
    var treeFiles = $(".treeFile");
    treeFiles.each(function (index) {
        treeFiles[index].style.background = "white";
        treeFiles[index].style.color = "black";
        treeFiles[index].style.boxShadow = "";
    })
}

function clearBucketMarkup(bucket) {
    var bkt = $(bucket);
    bkt.find(".treeFile").remove();
}

$("#downloadRevitFile").click(function () {

    var fileName = $("#fileName").val();
    var bucket = selectedBucket;
   
    var url = `https://developer.api.autodesk.com/oss/v2/buckets/${bucket}/objects/${fileName}`;

    $.ajaxTransport("+binary", function(options, originalOptions, jqXHR) {
        // check for conditions and support for blob / arraybuffer response type
        if (window.FormData && ((options.dataType && (options.dataType == 'binary')) || (options.data && ((window.ArrayBuffer && options.data instanceof ArrayBuffer) || (window.Blob && options.data instanceof Blob))))) {
            return {
                // create new XMLHttpRequest
                send: function(headers, callback) {
                    // setup all variables
                    var xhr = new XMLHttpRequest(),
                        url = options.url,
                        type = options.type,
                        async = options.async || true,
                        // blob or arraybuffer. Default is blob
                        dataType = options.responseType || "blob",
                        data = options.data || null,
                        username = options.username || null,
                        password = options.password || null;
    
                    xhr.addEventListener('load', function() {
                        var data = {};
                        data[options.dataType] = xhr.response;
                        // make callback and send data
                        callback(xhr.status, xhr.statusText, data, xhr.getAllResponseHeaders());
                    });
    
                    xhr.open(type, url, async, username, password);
    
                    // setup custom headers
                    for (var i in headers) {
                        xhr.setRequestHeader(i, headers[i]);
                    }
    
                    xhr.responseType = dataType;
                    xhr.send(data);
                },
                abort: function() {
                    jqXHR.abort();
                }
            };
        }
    });
  
    $.ajax({
        type: 'GET',
        url: url,
        dataType: 'binary',
        processData: false,
        headers: {
            "Authorization": "Bearer " + window.token,
            "Content-Type" : 'application/octet-stream'
        },
        success: function (data, textStatus) {
            console.log("FORGE FILE DOWNLOAD");
            console.log(textStatus);

            var
                blob = new Blob([data], { type: "octet/stream" }),
                url = window.URL.createObjectURL(blob);

            var a = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";

            a.href = url;
            a.download = fileName;
            a.click();
            window.URL.revokeObjectURL(url);
        }
    });
});

