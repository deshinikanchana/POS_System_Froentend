$('#orderBtn').click(function (event) {
    generateOrderId();
    loadCustomers();
    loadItems();
    generateDate();
    document.getElementById('totalLbl').innerHTML = '0.00';
    document.getElementById('subTotalLbl').innerHTML = '0.00';
    
});

var activities = document.getElementById("cust");
var selections = document.getElementById("items");

//-------------------------------------------------------------------------------------Auto Generate Order Id-------------------------------------------------------------------------------------

function generateOrderId() {
    try {
        let lastOID = orderTable[orderTable.length-1].getOrderId();


        let newOID = parseInt(lastOID.substring(1,4))+1;
        if (newOID < 10) {
            $("#txtOrderId").val("O00"+newOID);
        }else if (newOID < 100) {
            $("#txtOrderId").val("O0"+newOID);
        } else {
            $("#txtOrderId").val("D"+newOID);
        }
        $("#txtDiscount").val('00');
    } catch (e) {
        $("#txtOrderId").val("O001");
    }

    var buttonOrd = document.getElementById('txtOrderId');
    buttonOrd.disabled = true;
}

//-------------------------------------------------------------------------------------Auto Generate Date-------------------------------------------------------------------------------------

function generateDate(){
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();

    today = yyyy + '-' + mm + '-' + dd;
    $("#txtDate").val(today);
}

//-------------------------------------------------------------------------------------EventListners-------------------------------------------------------------------------------------


selections.addEventListener("click", function() {
    var options = selections.querySelectorAll("option");
    var count = options.length;
    var value = selections.value;
    var text = selections.options[selections.selectedIndex].text;
    
    getItemData(text-1);
});


activities.addEventListener("click", function() {
    var options = activities.querySelectorAll("option");
    var count = options.length;
    var value = activities.value;
    var text = activities.options[activities.selectedIndex].text;

        getData(text-1);
});


//-------------------------------------------------------------------------------------Order Cancel-------------------------------------------------------------------------------------

$('#ClearOrder').click(function (event) {
    let isempty = getAllOrders($("#txtOrderId").val());
    if(isempty.length != 0){
        let id = $("#txtOrderId").val();
        let option=confirm(`Do you want to delete Order Id:${id}`);

        if (option){
            let res=deleteWholeOrder(id);
            if (res){

                clearWhole();
                alert("Order Deleted Successfully !");
                var ClearBtn = document.getElementById('ClearOrder');
                ClearBtn.disabled = false;
                var cartBtn = document.getElementById('addToCart');
                cartBtn.disabled = false;
            } else{
                alert("Order Delete Failed !")
            }
        }
    }else{
        console.log("No Items In Cart")
    }

 });



$("#txtQuantity").on('keyup',function (event){
    if (event.key=="Enter"){
        var ok = checkStock($('#txtQuantity').val());
        if(ok){
            $('#addToCart').focus();
        }
    }
});




 //-------------------------------------------------------------------------------------Items remove-------------------------------------------------------------------------------------
 
 $('#RemoveItem').click(function (event) {
    let oId = $("#txtOrderId").val();
    let id = $("#lblCode").val();
    let name = $("#lblName").val();
    let price = $("#lblPrice").val();
    let qty = $("#txtQuantity").val();
    let total = price * qty;

    let option=confirm(`Do you want to delete from cart Item Id:${id}`);

    if (option){
        let res=removeItemFromCart(oId,id,total,qty);
        if (res){
            alert("Item Remove Successfully !");
            clearAllFields();
            loadAllOrdersToTheTable(oId);
            var custText = document.getElementById('RemoveItem');
            custText.disabled = true;
        } else{
            alert("Item Remove Failed !")
        }
    }
 });

//-------------------------------------------------------------------------------------Items Update In Cart-------------------------------------------------------------------------------------

 $('#UpdateItem').click(function (event) {
    let id = $("#lblCode").val();
    let qty = $('#txtQuantity').val();
    let option=confirm(`Do you want to Update from cart Item Id:${id}`);

    if (option){
        let res=updateCart(id,qty);
        if (res){
            alert("Cart Updated Successfully !");
            clearAllFields();
            loadAllOrdersToTheTable($("#txtOrderId").val());
            loadItems();
            var upBtn = document.getElementById('UpdateItem');
            upBtn.disabled = true;
        } else{
            alert("Cart Update Failed !")
        }
    }
 });

 //-------------------------------------------------------------------------------------Clear All-------------------------------------------------------------------------------------

 $('#ClearSlide').click(function (event) {
    clearWhole();
 });

 //-------------------------------------------------------------------------------------Search Bar Functions-------------------------------------------------------------------------------------

 $("#searchBar").on('keyup',function (event){
    if (event.key=="Enter"){
        let OrderId = $('#searchBar').val();
        console.log("orderID :" + OrderId)

        let OD = searchOrderDetails(OrderId);
        loadAllOrdersToTheTable(OrderId);
        document.getElementById('Purchase').disabled = true;
        document.getElementById('ClearOrder').disabled = true;
        document.getElementById('RemoveItem').disabled = true;
        document.getElementById('UpdateItem').disabled = true;
        document.getElementById('addToCart').disabled = true;
        
            if(OD != null){
                $("#txtOrderId").val(OD.getOrderId());
                $("#txtDate").val(OD.getDate());
                $("#CustIdLbl").val(OD.getCusId());
                let Cust = searchCustomer(OD.getCusId());
                $("#CustNameLbl").val(Cust.getCustomerName());
                $("#CustSalaryLbl").val(Cust.getCustomerSalary());
                $("#addr").val(Cust.getCustomerAddress());
                document.getElementById('totalLbl').innerHTML = OD.getTotal();
                document.getElementById('subTotalLbl').innerHTML = OD.getSubTotal();
                $("#txtCash").val(OD.getCash());
                $("#txtDiscount").val(OD.getDiscount());
                $("#txtBalance").val(OD.getBalance());
            }else{
                alert('Order Not Found !');
            }
    }
});



//-------------------------------------------------------------------------------------Add To Cart-------------------------------------------------------------------------------------

 
$('#addToCart').click(function (event) {

    let ordId = $('#txtOrderId').val();
    let itemCode=$('#lblCode').val();
    let itemName = $('#lblName').val();
    let itemPrice = $('#lblPrice').val();
    let itemQty = $('#lblQty').val();
    let buyQty = $('#txtQuantity').val();
    let price = (buyQty * itemPrice);

    if((itemCode.length > 1) & (itemQty.length >= 1)){

        let row=addToCartSave(ordId,itemCode,itemName,itemPrice,buyQty,price);
            
        if(row){
            clearAllFields();
            setBalance(price,'+');
            stockControl(itemCode,buyQty,'-');
            loadItems();
            loadAllOrdersToTheTable(ordId);
        }else{
            alert('Add To Cart Operation Faild !');
            event.preventDefault();
        }

    }else{
        alert('Fill Fields First !')
        event.preventDefault();
    }
});




//-------------------------------------------------------------------------------------Cart Purchase-------------------------------------------------------------------------------------


$('#Purchase').click(function (event) {

    let ordID=$('#txtOrderId').val();
    let ordDate = $('#txtDate').val();
    let custId = $('#CustIdLbl').val();
    let Tot = document.getElementById("totalLbl").textContent;
    let Disc=$('#txtDiscount').val();
    let Subtot = document.getElementById("subTotalLbl").textContent
    let Csh = $('#txtCash').val();
    let Bal = $('#txtBalance').val();
   


    if((custId.length > 1) & (Csh.length > 1)){
       
        let isOk=saveOrder(ordID,ordDate,custId,Tot,Disc,Subtot,Csh,Bal);
        if(isOk){
           clearWhole();
           alert('Order Saved Successfully !');
        }

}else{
    alert('Order is Not Completed !')
    event.preventDefault()
}
});

//-------------------------------------------------------------------------------------Functions-------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------Set SelectBox Values-------------------------------------------------------------------------------------
function getItemData(num){

    $("#lblCode").val(itemTable[num].getItemCode());
    $("#lblName").val(itemTable[num].getItemName());
    $("#lblQty").val(itemTable[num].getItemQty());
    $("#lblPrice").val(itemTable[num].getItemPrice());

}

function getData(row){

    var oTable = document.getElementById('tblCustomers');
    var rowLength = oTable.rows.length;
    var oCells = oTable.rows.item(row).cells;
    var cellLength = oCells.length;

    $("#CustIdLbl").val(oCells.item(0).innerHTML);
    $("#CustNameLbl").val(oCells.item(1).innerHTML);
    $("#CustSalaryLbl").val(oCells.item(2).innerHTML);
    $("#addr").val(oCells.item(3).innerHTML);
   
}

function loadCustomers(){
    removeOpt('#cust');
    for(var t = 0; t<= Custcount;t++){
        setOptions('cust',t);
    }
}

function loadItems(){
    removeOpt('#items');
    for(var t = 0; t<= Itemcount;t++){
        setOptions('items',t);
    }
}

function setOptions(id,ans){
    var select = document.getElementById(id);
    opt = document.createElement("option");
    
    if(ans==0){
        opt.value = 'select here';
        opt.textContent ='select here';   
    }else{
        opt.value = ans;
    opt.textContent =ans;
    }

    select.appendChild(opt);
}

function removeOpt(id){
    $(id).empty();  
}

//-------------------------------------------------------------------------------------Order Functions-------------------------------------------------------------------------------------

function saveOrder(oId,oDate,custId,total,discount,subTotal,cash,balance) {
    let orderDetail = new OrderDetailsDTO(oId,oDate,custId,total,discount,subTotal,cash,balance);
    alert(orderDetailTable);

    orderDetailTable.push(orderDetail);// orderDetails added
    return true;
}


function addToCartSave(orderId,code,name,price,qty,total){

    let order = new OrderDTO(orderId,code,name,price,qty,total);
    orderTable.push(order);// order added

    for (var i in orderTable){
        if (orderTable[i].getOrderId()==orderId){
        }
    }

     loadAllOrdersToTheTable(orderId);

     $('#tblOrders').on('click', 'tr', function(e){
        let code = $(this).children('td:eq(0)').text();
        let name = $(this).children('td:eq(1)').text();
        let price = $(this).children('td:eq(2)').text();
        let qty = $(this).children('td:eq(3)').text();
        let total = $(this).children('td:eq(4)').text();

        $('#lblCode').val(code);
        $('#lblName').val(name);
        $('#lblPrice').val(price);
        $('#txtQuantity').val(qty);


      });
    console.log('Saved');
    return true;
}


function searchOrder(Oid,id){
    for (var i in orderTable){
        if ((orderTable[i].getOrderId()==Oid)&(orderTable[i].getItemCode()==id)) return orderTable[i];
    }
    return null;
}


function searchOrderDetails(id){
    for (var i in orderDetailTable){
        if (orderDetailTable[i].getOrderId()==id) 
         return orderDetailTable[i];
    }
    return null;
}

function updateCart(id,qty){
    let ord = searchOrder($("#txtOrderId").val(),id);
    if (ord != null) {
        if(qty > ord.getQty()){
            let max = Number(qty - ord.getQty());
            stockControl(id,max,'-');
            setBalance((max*ord.getPrice()),'+');
        }else{
            let min = Number(ord.getQty()-qty);
            stockControl(id,min,'+');
            setBalance(((min)*ord.getPrice()),'-');
        }

        let Total = qty*ord.getPrice();
        ord.setQty(qty);
        ord.setTotal(Total);

        let DD = searchOrder($("#txtOrderId").val(),id);
        console.log("After Update row :"+DD.getOrderId())
        console.log("After Update row :"+DD.getQty())
        console.log("After Update row :"+DD.getTotal())

        return true;
    } else {
        return false;
    }
 }


 function loadAllOrdersToTheTable(oId) {
    let allOrders = getAllOrders(oId);

    if(allOrders.length != 0){
        $('#tblOrders').empty();
        for(i=0;i<allOrders.length;i++){
            
            let OrderId = allOrders[i].getOrderId();
            let ItemCode = allOrders[i].getItemCode();
            let ItemName = allOrders[i].getItemName();
            let Price = allOrders[i].getPrice();
            let Qty = allOrders[i].getQty();
            let total = allOrders[i].getTotal();

            var nRow = `<tr><td>${ItemCode}</td><td>${ItemName}</td><td>${Price}</td><td>${Qty}</td><td>${total}</td></tr>`;
            $('#tblOrders').append(nRow);
        }
    }
    // alert('No Items In Cart !')
}

function getAllOrders(oId){
        let orderList = [];
    for (var i in orderTable){
        if (orderTable[i].getOrderId()==oId) {
            orderList.push(orderTable[i]);
        }
    }
    return orderList;
}


function setSubTotal(){
    let disc = $('#txtDiscount').val();
    let first = document.getElementById("totalLbl").textContent;
    let second = (first * disc)/100;
    let third = first - second;
    document.getElementById('subTotalLbl').innerHTML = third + '.00';
 }

 function deleteWholeOrder(id){
    let allOrders = getAllOrders(id);
        
    if(allOrders.length >= 1){
        for(i=0;i<allOrders.length;i++){
            stockControl(allOrders[i].getItemCode(),allOrders[i].getQty(),'+');
            let finish = deleteCartRow(allOrders[i].getOrderId(),allOrders[i].getItemCode());
        }
        return true;
    }else{
        return false;
    }

 }

 function deleteCartRow(orderId,ItemId){
    let ordr = searchOrder(orderId,ItemId);
    if (ordr != null) {
        let indexNumber = orderTable.indexOf(ordr);
        orderTable.splice(indexNumber, 1);
        return true;
    } else {
        return false;
    }
 }
 

function removeItemFromCart(ordId,itemCode,total,qty){
    stockControl(itemCode,qty,'+');
    setBalance(total,'-');
    $('#txtDiscount').val('');
    $('#txtDiscount').focus();
    let resp = deleteCartRow(ordId,itemCode);
    if(resp){
        return true;
    }
    return false;
}


function checkStock(buy){
    console.log('buy Qty : ' + buy)
    console.log('stock Qty : ' + $('#lblQty').val())

    if (buy>Number($('#lblQty').val())){
             $("#txtQuantity").css('border','2px solid red');
             $("#lblQtyWarning").text('Enter qty lower than '+$('#lblQty').val());
             $('#txtQuantity').focus();
             return false;
         }else{
             $("#txtQuantity").css('border','2px solid green');
             $("#lblQtyWarning").text('');
             return true;
         }
}


function setBalance(price,mark){
  
    var ch = document.getElementById("totalLbl").textContent;
    var x = Number(ch)
    let tot= 0;
     if(mark === '+'){
          tot = (x + price);
     }else{
          tot = (x - price);
     }
    document.getElementById('totalLbl').innerHTML ='';
    document.getElementById('totalLbl').innerHTML = tot + '.00';

}

function stockControl(itemCode,buyQty,mark){
    let itom = searchItem(itemCode);
    let newQty =0;
    if(mark === '-'){
        newQty = (Number(itom.getItemQty() - buyQty));
    }else{
        newQty = (Number(itom.getItemQty()) + Number(buyQty));
    }

    let res= updateItem(itom.getItemCode(), itom.getItemName(), newQty, itom.getItemPrice());
    if(res){
        loadItems();
    }
}

function clearAllFields(){
    loadItems();
    $('#lblCode').val('');
    $('#lblName').val('');
    $('#lblPrice').val('');
    $('#lblQty').val('');
    $('#txtQuantity').val('');
    $('#items').focus();
    var ordBtn = document.getElementById('addToCart');
    ordBtn.disabled = false;
}


function clearWhole(){
    clearAllFields();
    loadCustomers();
    generateOrderId();
    generateDate();
    $('#tblOrders').empty();
    document.getElementById('totalLbl').innerHTML = '0.00';
    document.getElementById('subTotalLbl').innerHTML = '0.00';
    $('#CustIdLbl').val('');
    $('#CustNameLbl').val('');
    $('#CustSalaryLbl').val('');
    $('#txtBalance').val('');
    $('#txtDiscount').val('');
    $('#txtCash').val('');
    $('#addr').val('');
    $('#searchBar').val('');
    $("#txtQuantity").css('border','2px solid grey');
    $("#searchBar").css('border','2px solid grey');
    $("#lblQtyWarning").text('');
    document.getElementById('Purchase').disabled = false;
    document.getElementById('ClearOrder').disabled = false;
    document.getElementById('RemoveItem').disabled = false;
    document.getElementById('UpdateItem').disabled = false;
    document.getElementById('addToCart').disabled = false;
}


function getAllODs(){
    return orderDetailTable;
}

//-------------------------------------------------------------------------------------Validations-------------------------------------------------------------------------------------
let OdReg=/^\d{1,2}$/;
let ordIdReg =/^((O)[0-9]{2})[^a-zA-Z]$/;

$("#txtDiscount").on('keyup',function (event){
    if (OdReg.test($("#txtDiscount").val())){
        $("#txtDiscount").css('border','2px solid green');
        if (event.key=="Enter"){
           setSubTotal();
         $('    #txtCash').focus();
     }
    }else{
        $("#txtDiscount").css('border','2px solid red');
        if (event.key=="Enter"){
         $('#txtDiscount').focus();
     }
    }
 });


 $("#txtCash").on('keyup',function (event){

    if (itemReg.test($("#txtCash").val())){
        $("#txtCash").css('border','2px solid green');
        if (event.key=="Enter"){
         let mon = $("#txtCash").val();
         let subb = document.getElementById("subTotalLbl").textContent;
         $('#txtBalance').val((mon - subb));
 
 
         $('#Purchase').focus();
     }
    }else{
        $("#txtCash").css('border','2px solid red');
        if (event.key=="Enter"){
         $('#txtCash').focus();
     }
    }
 });


 $("#searchBar").on('keyup',function (event){

    if (ordIdReg.test($("#searchBar").val())){
        $("#searchBar").css('border','2px solid green');
    }else{
        $("#searchBar").css('border','2px solid red');
    }
 });
 
$('#txtOrderId,#cust,#items,#txtQuantity','#addToCart','#txtCash','#txtDiscount','#txtBalance','#Purchase').on('keydown',function (event){
    if (event.key=="Tab"){
        event.preventDefault();
    }
});