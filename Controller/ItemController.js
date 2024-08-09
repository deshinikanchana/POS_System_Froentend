let isvalidate = false;
let codeVal = false;
let descVal = false;
let priceVal = false;
let qtyVal = false;
let count2;
let Itemcount = $('#tblItems').find('tr').length;


$('#itemBtn').click(function (event) {
    $('#txtItemCode').focus();
    loadAllItemsToTheTable();
    clearAllItems();
});


// ---------------------------------------------------------------------Save Item---------------------------------------------------------------------
$('#btnAddItem').click(function (event) {

    let code=$('#txtItemCode').val();
    let name = $('#txtItemName').val();
    let qty = $('#txtItemQty').val();
    let price = $('#txtItemPrice').val();
    
    
    if((code.length > 1) & (name.length > 1) & (qty.length > 1) & (price.length > 1)){

        if((codeVal) & (descVal) & (priceVal) & (qtyVal)){
            isvalidate =true;
        }

        isAvailable(code);
        if(isvalidate){
            const itemData = {
                itemCode:code,
                itemName:name,
                itemQty:qty,
                itemPrice:price
            };


            const ItemJSON = JSON.stringify(itemData)
            
            $.ajax({
                url:"http://localhost:8080/Pos_System_App/item",
                type: "POST",
                data:ItemJSON,
                headers:{"Content-Type" : "application/json"},
                success: (res)=>{
                    console.log(JSON.stringify(res));
                    clearAllItems();
                },
                error:(res)=>{
                    console.log("res :" + res)
                }
            })
            Itemcount = Itemcount+1;
        }

    }else{
        alert('Fill Fields First !')
        event.preventDefault()
    }
});
// ---------------------------------------------------------------------clear Fields ---------------------------------------------------------------------

$('#btnClearItem').click(function(){
    clearAllItems();
    var itemText = document.getElementById('txtItemCode');
    itemText.disabled = false;
    loadAllItemsToTheTable()
});

// ---------------------------------------------------------------------Get Item Details---------------------------------------------------------------------

$('#btnGetAllItem').click(function(){
    searchItem($('#txtItemCode').val());
});

// ---------------------------------------------------------------------Update Item---------------------------------------------------------------------

$("#btnUpdateItem").click(function () {
    let code=$('#txtItemCode').val();
    let name = $('#txtItemName').val();
    let qty = $('#txtItemQty').val();
    let price = $('#txtItemPrice').val();

    let option=confirm(`Do you want to Update Item Code:${code}`);
    if (option){
        const itemDt = {
            itemName: name,
            itemQty: qty,
            itemPrice: price
        };

        $.ajax({
            url: "http://localhost:8080/Pos_System_App/item?itemCode=" + `${code}`,
            type: "PUT",
            data: JSON.stringify(itemDt),
            headers: { "Content-Type": "application/json" },
            success: (resp) => {
                console.log(JSON.stringify(resp));
                alert("Item Updated Successfully");
                clearAllItems();
                
            },
            error: (jqXHR, textStatus, errorThrown) => {
                console.log("Error: " + textStatus + ", " + errorThrown);
                console.log("Response: ", jqXHR.responseText);
                alert("Update Failed: " + jqXHR.responseText);
            }
        });
    }

});

// ---------------------------------------------------------------------Delete Item---------------------------------------------------------------------

$("#btnDeleteItem").click(function () {
    let code = $("#txtItemCode").val();
    let option=confirm(`Do you want to delete Item Code:${code}`);

    if (option){
        $.ajax({
            url:"http://localhost:8080/Pos_System_App/item?itemCode=" + `${code}`,
            type: "DELETE",
            headers:{"Content-Type" : "application/json"},
            success: (res)=>{
                console.log(JSON.stringify(res)); 
                alert("Item Deleted");
                Itemcount = Itemcount-1;
                var itemText = document.getElementById('txtItemCode');
                itemText.disabled = false;
                clearAllItems();
            },
            error:(res)=>{
                console.log("res :" + res)
                alert("Item Delete Failed")
                return null; 
            }
        });
    }
});


// ---------------------------------------------------------------------Functions---------------------------------------------------------------------

$('#itemTable').on('click', 'tr', function(e){
    clickRow($(this).html());
  });
  
  function clickRow(ARow) {
    var myJSON = JSON.stringify(ARow);
    console.log(myJSON)
    searchItem(myJSON.slice(5,12));
  }


function loadAllItemsToTheTable() {
    getAllItems();
}


 function getAllItems() {
    var AllItems =[];
    $.ajax({
        url:"http://localhost:8080/Pos_System_App/item",
        type: "GET",
        headers:{"Content-Type" : "application/json"},
        success: (res)=>{
            console.log(JSON.stringify(res));  

            for(let i =0;i<res.length;i++){
                let single = res[i];
                var AllValues = Object.keys(single).map(function (key){
                    return single[key];

                })
                AllItems.push(new ItemDTO(AllValues[0],AllValues[1],AllValues[3],AllValues[2]));
              
                $('#tblItems').empty();
                for (let j =0;j<AllItems.length;j++) {
                    let code = AllItems[j].getItemCode();
                    let name = AllItems[j].getItemName();
                    let qty = AllItems[j].getItemQty();
                    let price = AllItems[j].getItemPrice();


        var row = `<tr><td>${code}</td><td>${name}</td><td>${qty}</td><td>${price}</td></tr>`;
        $('#tblItems').append(row);
    }
            }
            count2 = AllItems.length;
        },
        error:(res)=>{
            console.log("res :" + res)
            return null;
        }
    })
 }

function searchItem(code) {
    if(code.length>1){
        $.ajax({
            url:"http://localhost:8080/Pos_System_App/item",
            type: "GET",
            data:{"itemCode": code},
            headers:{"Content-Type" : "application/json"},
            success: (res)=>{
                console.log(JSON.stringify(res));   
              
                var values = Object.keys(res).map(function (key){
                    return res[key];
                })
               var itemArr = new ItemDTO(values[0],values[1],values[3],values[2]);
               if (itemArr != null){
                    $("#txtItemCode").val(itemArr.getItemCode());
                    $("#txtItemName").val(itemArr.getItemName());
                    $("#txtItemQty").val(itemArr.getItemQty());
                    $("#txtItemPrice").val(itemArr.getItemPrice());
            
                    var itemtxt = document.getElementById('txtItemCode');
                    itemtxt.disabled = true;
                }else {
                alert("Item Not Found !");
                clearAllItems();
                }
            },
            error:(res)=>{
                console.log("res :" + res)
               
            }
        })
    } else{
        alert('Enter a Item Code !')
    }
}


function isAvailable(code){
    $.ajax({
        url:"http://localhost:8080/Pos_System_App/item",
        type: "GET",
        data:{"itemCode": code},
        headers:{"Content-Type" : "application/json"},
        success: (res)=>{
            console.log(JSON.stringify(res));   
            var test = Object.keys(res).map(function (key){
                return res[key];
            })

          if(test[0] != code){
            return false;
          }
          alert("This ID Already Added !!!")
        },
        error:(res)=>{
            console.log("res :" + res)
           
        }
    })
}



function normal(){
    $('#txtItemCode').focus();
    $("#ICode").text("");
    $("#IName").text('');
    $("#IQty").text('');
    $("#IPrice").text('');
    $("#txtItemPrice").css('border','2px solid grey');
    $("#txtItemName").css('border','2px solid grey');
    $("#txtItemQty").css('border','2px solid grey');
    $("#txtItemCode").css('border','2px solid grey');
}

function clearAllItems() {
    $('#txtItemCode').val('');
    $('#txtItemName').val('');
    $('#txtItemQty').val('');
    $('#txtItemPrice').val('');
    $("#txtItemCode").focus();
    normal();
    loadAllItemsToTheTable();
}

// ---------------------------------------------------------------------Validations---------------------------------------------------------------------

let itemCodeReg=/^((I00-)[0-9]{2,100})/;
let itemReg =/^-?\d+\.?\d*$/;
let itemNameReg =/^[A-Z][a-z]{3,}/;

 $("#txtItemCode").on('keyup',function (event){
      if (event.key=="Enter"){
          $('#txtItemName').focus();
      }


    if (itemCodeReg.test($("#txtItemCode").val())){
        $("#txtItemCode").css('border','2px solid green');
        $("#ICode").text("");
        let avail = isAvailable($("#txtItemCode").val());
        if(!avail){
        codeVal = true;
       
        }else{
            $("#ICode").text("This Id Already Added");
          
            codeVal=false;
        }
    }else{
        $("#txtItemCode").css('border','2px solid red');
        $("#ICode").text('Your Input Data Format is Invalid (I00-001)');
        codeVal=false;
    }
 });


 $("#txtItemName").on('keyup',function (event){
     if (event.key=="Enter"){
         $('#txtItemQty').focus();
     }

    if (itemNameReg.test($("#txtItemName").val())){
        $("#txtItemName").css('border','2px solid green');
        $("#IName").text('');
        descVal= true;
    }else{
        $("#txtItemName").css('border','2px solid red');
        $("#IName").text('Your Input Data Format is Invalid (Abcde)');
        descVal=false;
    }
 });

 $("#txtItemQty").on('keyup',function (event){
     if (event.key=="Enter"){
         $('#txtItemPrice').focus();
     }

    if (itemReg.test($("#txtItemQty").val())){
        $("#txtItemQty").css('border','2px solid green');
        $("#IQty").text(' ');
        qtyVal= true;
    }else{
        $("#txtItemQty").css('border','2px solid red');
        $("#IQty").text('Your Input Data Format is invalid (numbers only)');
        qtyVal=false;
    }
});

$("#txtItemPrice").on('keyup',function (event){
    if (event.key=="Enter"){
        $('#btnAddItem').focus();
    }

   if (itemReg.test($("#txtItemPrice").val())){
       $("#txtItemPrice").css('border','2px solid green');
       $("#IPrice").text(' ');
       priceVal= true;
   }else{
       $("#txtItemPrice").css('border','2px solid red');
       $("#IPrice").text('Your Input Data Format is invalid (numbers only)');
       priceVal=false;
   }
});

$("#btnAddItem").on('keyup',function (event) {
    if (event.key == "Enter") {
        $('#btnClearItem').focus();
    }
});

$('#txtItemCode,#txtItemName,#txtItemQty,#txtItemPrice').on('keydown',function (event){
    if (event.key=="Tab"){
        event.preventDefault();
    }
});
