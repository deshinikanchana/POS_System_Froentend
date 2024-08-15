let count3;
let ordersAll = [];
let TempOrderDetailsList = [];
let OrdData;

$('#orderBtn').click(function (event) {
    getAllODs();
    generateDate();
    ItemSet();
    custSet();
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


function getAllODs(){
    orderTable =[];
    var LengthList = [];
    $.ajax({
        url:"http://localhost:8080/Pos_System_App/order",
        type: "GET",
        headers:{"Content-Type" : "application/json"},
        success: (res)=>{
            //console.log(JSON.stringify(res));  

            for(let i =0;i<res.length;i++){
                let Odcount = res[i];
                var AllOds = Object.keys(Odcount).map(function (key){
                    return Odcount[key];

                })
                LengthList.push(new OrderDTO(AllOds[5],AllOds[2],AllOds[4],AllOds[6],AllOds[3],AllOds[7],AllOds[1],AllOds[0]));
                setOrdVals(LengthList[i]);
                
            }
            count3 = LengthList.length;
            generateOrderId();
        },
        error:(res)=>{
            console.log("res :" + res)
            
        }
    })

}


function setOrdVals(ordData){
    orderTable.push(new OrderDTO(ordData.getOrderId(),ordData.getCusId(),ordData.getOrderDate(),ordData.getOrderTotal(),ordData.getDiscount(),ordData.getSubTotal(),ordData.getCash(),ordData.getBalance()))
    return true;
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

//-------------------------------------------------------------------------------------Extra Functions-------------------------------------------------------------------------------------


function ItemSet() {

    var x = document.getElementById("items");
    x.length = 1;

    for(let m = 1; m<=count2;m++){
        var option = document.createElement("option");
        if(m<10){
        option.text="I00-00" + m;
        x.add(option);
        }else if(10<m<100){
            option.text="I00-0" + m;
            x.add(option);
        }else{
            option.text="I00-" + m;
            x.add(option);
        }
    }
}

function custSet(){
    var y = document.getElementById("cust");
    y.length =1;
    for(let n = 1;n<=count1;n++){
        var opt = document.createElement("option");
        if(n<10){
           opt.text = "C00-00"+n;
           y.add(opt);
            
        }else if(10<row<100){
          opt.text ="C00-0"+n;
          y.add(opt);

        }else{
            opt.text = "C00-"+n;
            y.add(opt);
        }
    }
}

selections.addEventListener("click", function() {
   getItemData(document.querySelector('#items').value);
});

activities.addEventListener("click", function() {
        getData(document.querySelector('#cust').value);
});


//-------------------------------------------------------------------------------------Order Cancel-------------------------------------------------------------------------------------

$('#ClearOrder').click(function (event) {
    orderDetailTable = [];
    getAllOrderDetails($("#txtOrderId").val());
    if(orderDetailTable.length != 0){
        let id = $("#txtOrderId").val();
        let option=confirm(`Do you want to Cancel Order:${id}`);

        if (option){
            let res=deleteWholeOrder();
            if (res){
                clearWhole();
                alert("Order Cancled Successfully !");
                var ClearBtn = document.getElementById('ClearOrder');
                ClearBtn.disabled = false;
                var cartBtn = document.getElementById('addToCart');
                cartBtn.disabled = false;
            } else{
                alert("Order Cancel Failed !")
            }
        }
    }else{
        console.log("No Items In Cart")
    }

 });

 function deleteWholeOrder(){
        
    if(TempOrderDetailsList.length >= 1){
        for(i=0;i<TempOrderDetailsList.length;i++){
            stockControl(TempOrderDetailsList[i].getItemCode(),TempOrderDetailsList[i].getBuyQty(),"+");
        }
        TempOrderDetailsList = [];
        return true;
    }else{
        return false;
    }

 }

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

    let option=confirm(`Do you want to Remove from cart Item :${id}`);

    if (option){
        let res=removeItemFromCart(oId,id,total,qty);
        if (res){
            alert("Item Remove Successfully !");
            clearAllFields();
            loadAllOrderDataToTheTable();
            var custText = document.getElementById('RemoveItem');
            custText.disabled = true;
        } else{
            alert("Item Remove Failed !")
        }
    }
 });

 function removeItemFromCart(ordId,itemCode,total,qty){
    setBalance(total,'-');
    stockControl(itemCode,qty,"+")
    $('#txtDiscount').val('');
    $('#txtDiscount').focus();
    let resp = deleteCartRow(ordId,itemCode);
    if(resp){
        return true;
    }
    return false;
}

function deleteCartRow(orderId,ItemId){
    let ordr = searchOrder(orderId,ItemId);
    if (ordr != null) {
        let indexNumber = TempOrderDetailsList.indexOf(ordr);
        TempOrderDetailsList.splice(indexNumber, 1);

        return true;
    } else {
        return false;
    }
 }

//-------------------------------------------------------------------------------------Items Update In Cart-------------------------------------------------------------------------------------

 $('#UpdateItem').click(function (event) {
    let id = $("#lblCode").val();
    let qty = $('#txtQuantity').val();
    let option=confirm(`Do you want to Update from cart Item :${id}`);

    if (option){
        let res=updateCart(id,qty);
        if (res){
            alert("Cart Updated Successfully !");
            clearAllFields();
           loadAllOrderDataToTheTable();
            ItemSet();
            var upBtn = document.getElementById('UpdateItem');
            upBtn.disabled = true;
        } else{
            alert("Cart Update Failed !")
        }
    }
 });

 function updateCart(id,qty){
    let ord = searchOrder($("#txtOrderId").val(),id);
    if (ord.length != 0) {
        for(let b = 0;b<ord.length;b++){
            let itemData = searchitem(ord[b].getItemCode());
          
        if(qty > ord[b].getBuyQty()){
            let max = Number(qty - ord[b].getBuyQty());
            stockControl(id,max,'-');
            setBalance((max*itemData.getItemPrice()),'+');
            
        }else{
            let min = Number(ord[b].getBuyQty()-qty);
            stockControl(id,min,'+');
            setBalance(((min)*itemData.getItemPrice()),'-');
        }

        let Total = qty*itemData.getItemPrice();
        ord[b].setBuyQty(qty);
        ord[b].setItemTotal(Total);
    }

        return true;
    } else {
        return false;
    }
 }

 //-------------------------------------------------------------------------------------Clear All-------------------------------------------------------------------------------------

 $('#ClearSlide').click(function (event) {
    clearWhole();
 });

 //-------------------------------------------------------------------------------------Search Bar Functions-------------------------------------------------------------------------------------

 $("#searchBar").on('keyup',function (event){
    if (event.key=="Enter"){
        let OrderId = $('#searchBar').val();

        searchOrderDetails(OrderId);
        getAllOrderDetails(OrderId);
        document.getElementById('Purchase').disabled = true;
        document.getElementById('ClearOrder').disabled = true;
        document.getElementById('RemoveItem').disabled = true;
        document.getElementById('UpdateItem').disabled = true;
        document.getElementById('addToCart').disabled = true;
    }
});


function SetDetails(OD){
            if(OD != null){
                let formattedDate = DateFormatter(OD.getOrderDate());
                $("#txtOrderId").val(OD.getOrderId());
                $("#txtDate").val(formattedDate);
                $("#CustIdLbl").val(OD.getCusId());

                let Cust = searchcustomer(OD.getCusId());
                $("#CustNameLbl").val(Cust.getCustomerName());
                $("#CustSalaryLbl").val(Cust.getCustomerSalary());
                $("#addr").val(Cust.getCustomerAddress());
                document.getElementById('totalLbl').innerHTML = OD.getOrderTotal();
                document.getElementById('subTotalLbl').innerHTML = OD.getSubTotal();
                $("#txtCash").val(OD.getCash());
                $("#txtDiscount").val(OD.getDiscount());
                $("#txtBalance").val(OD.getBalance());
                ItemSet();
                custSet();
            }else{
                alert('Order Not Found !');
            }
}

function DateFormatter(Date){
        const [day, month, year] = Date.split('-');
        return `${year}-${month}-${day}`;
}
    
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

        let row=addToCartSave(ordId,itemCode,buyQty,price,itemName);
            
        if(row){
            clearAllFields();
            setBalance(price,'+');
            stockControl(itemCode,buyQty,'-');
            ItemSet();
           loadAllOrderDataToTheTable();
        }else{
            alert('Add To Cart Operation Faild !');
            event.preventDefault();
        }

    }else{
        alert('Fill Fields First !')
        event.preventDefault();
    }
});

function addToCartSave(orderId,code,qty,total,name){

    let order = new OrderDetailsDTO(orderId,code,qty,total);
    TempOrderDetailsList.push(order);// order added

    loadAllOrderDataToTheTable();

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
        $('#lblQty').val(searchitem(code).getItemQty());


      });
    console.log('Saved');
    return true;
}


//-------------------------------------------------------------------------------------Cart Purchase-------------------------------------------------------------------------------------


$('#Purchase').click(function (event) {

    let ordID=$('#txtOrderId').val();
    let ordDate = $('#txtDate').val();
    let custId = $('#CustIdLbl').val();
    let Tot = parseInt(document.getElementById("totalLbl").textContent,10);
    let Disc=$('#txtDiscount').val();
    let Subtot = parseInt(document.getElementById("subTotalLbl").textContent,10);
    let Csh = $('#txtCash').val();
    let Bal = parseInt($('#txtBalance').val(),10);
   


    if((custId.length > 1) & (Csh.length > 1)){

        let saveOrd = new OrderDTO(ordID,custId,ordDate,Tot,Disc,Subtot,Csh,Bal);
       
        let isOk=saveOrder(saveOrd);
        if(isOk){
           clearWhole();
           alert('Order Saved Successfully !');
        }

}else{
    alert('Order is Not Completed !')
    event.preventDefault()
}
});

function saveOrder(orderDto) {

    if(orderDto != null){
        const or = [];
        for(let l=0;l<TempOrderDetailsList.length;l++){
            or.push(new OrderDetailsDTO(
                TempOrderDetailsList[l].getOrderId(),
                TempOrderDetailsList[l].getItemCode(),
                TempOrderDetailsList[l].getBuyQty(),
                TempOrderDetailsList[l].getItemTotal()))
        }

         const purch = {
            "orderDto" :{
               "orderId": orderDto.getOrderId(),
                "cusId" : orderDto.getCusId(),
                "orderDate":orderDto.getOrderDate(),
                "orderTotal":orderDto.getOrderTotal(),
                "discount":orderDto.getDiscount(),
                "subTotal":orderDto.getSubTotal(),
                "cash":orderDto.getCash(),
                "balance":orderDto.getBalance()
            },
            "orderList" : or
         }
         console.log(JSON.stringify(purch))
        
        
        
         $.ajax({
             url:"http://localhost:8080/Pos_System_App/order",
             type: "POST",
             data:JSON.stringify(purch),
             headers:{"Content-Type" : "application/json"},
             success: (res)=>{
                 //console.log(JSON.stringify(res));
                 clearWhole();
             },
             error:(res)=>{
                 console.log("res :" + res)
             }
         });
    }else{
        alert('Incomplete Order !');
        event.preventDefault();
    }}

//-------------------------------------------------------------------------------------Set SelectBox Values-------------------------------------------------------------------------------------

function getItemData(num){
    let detail = searchitem(num);

      $("#lblCode").val(detail.getItemCode());
      $("#lblName").val(detail.getItemName());
      $("#lblQty").val(detail.getItemQty());
      $("#lblPrice").val(detail.getItemPrice());
      ItemSet(); 
}

function getData(row){
    let cusDt = searchcustomer(row)

    $("#CustIdLbl").val(cusDt.getCustomerId());
    $("#CustNameLbl").val(cusDt.getCustomerName());
    $("#CustSalaryLbl").val(cusDt.getCustomerAddress());
    $("#addr").val(cusDt.getCustomerSalary());
   custSet();
}

//-------------------------------------------------------------------------------------Order Functions-------------------------------------------------------------------------------------

function searchOrder(Oid,id){
    let ordList = [];
    for (var i in TempOrderDetailsList){
        if ((TempOrderDetailsList[i].getOrderId()==Oid)&(TempOrderDetailsList[i].getItemCode()==id)) {
           ordList.push(new OrderDetailsDTO(TempOrderDetailsList[i].getOrderId(),TempOrderDetailsList[i].getItemCode(),TempOrderDetailsList[i].getBuyQty(),TempOrderDetailsList[i].getItemTotal()))
        }
    return ordList;
    }
}

function searchOrderDetails(id){
    orderTable = [];
    if(id.length > 1){
        $.ajax({
            url:"http://localhost:8080/Pos_System_App/order",
            type: "GET",
            data:{"orderId": id},
            headers:{"Content-Type" : "application/json"},
            success: (res)=>{
                //console.log(JSON.stringify(res));   
              
                var val = Object.keys(res).map(function (key){
                    return res[key];
                })
               let ans = setOrdVals(new OrderDTO(val[5],val[2],val[4],val[6],val[3],val[7],val[1],val[0]));
               if(ans){
                SetDetails(orderTable[0]);
               }
            },
            error:(res)=>{
                console.log("res :" + res)
               
            }
        })

    } else{
    alert('Enter a Order Id !')
}
}


 function loadAllOrderDataToTheTable() {
    
    if(TempOrderDetailsList.length != 0){
        $('#tblOrders').empty();
        for(i=0;i<TempOrderDetailsList.length;i++){
            
            let ItemCode = TempOrderDetailsList[i].getItemCode();

            let ItemData = searchitem(ItemCode);

            let ItemName = ItemData.getItemName();
            let Price = ItemData.getItemPrice();
            let Qty = TempOrderDetailsList[i].getBuyQty();
            let total = TempOrderDetailsList[i].getItemTotal();

            var nRow = `<tr><td>${ItemCode}</td><td>${ItemName}</td><td>${Price}</td><td>${Qty}</td><td>${total}</td></tr>`;
            $('#tblOrders').append(nRow);
        }
    }
    // alert('No Items In Cart !')
}

function loadOrderDetailsTable() {
    
    if(orderDetailTable.length != 0){
        $('#tblOrders').empty();
        for(i=0;i<orderDetailTable.length;i++){
            
            let ItemCode = orderDetailTable[i].getItemCode();

            let ItemData = searchitem(ItemCode);

            let ItemName = ItemData.getItemName();
            let Price = ItemData.getItemPrice();
            let Qty = orderDetailTable[i].getBuyQty();
            let total = orderDetailTable[i].getItemTotal();

            var nRow = `<tr><td>${ItemCode}</td><td>${ItemName}</td><td>${Price}</td><td>${Qty}</td><td>${total}</td></tr>`;
            $('#tblOrders').append(nRow);
        }
    }
    // alert('No Items In Cart !')
}


function getAllOrderDetails(oId){
    orderDetailTable = [];
    if(oId.length > 1){
        $.ajax({
            url:"http://localhost:8080/Pos_System_App/orderDetails",
            type: "GET",
            data:{"orderId": oId},
            headers:{"Content-Type" : "application/json"},
            success: (res)=>{
                //console.log(JSON.stringify(res));   
              
                for(let i =0;i<res.length;i++){
                    let ord = res[i];
                    var Alls = Object.keys(ord).map(function (key){
                        return ord[key];
    
                    })
                    ordersAll.push(new OrderDetailsDTO(Alls[3],Alls[1],Alls[0],Alls[2]));
                    setOrderDetailsVals(ordersAll[i]);
                }
                loadOrderDetailsTable();
            },
            error:(res)=>{
                console.log("res :" + res)
               
            }
        })
        return ordersAll;

    } else{
    alert('Enter a Customer Id !')
    }
}


function setOrderDetailsVals(orddetails){
    orderDetailTable.push(new OrderDetailsDTO(orddetails.getOrderId(),orddetails.getItemCode(),orddetails.getBuyQty(),orddetails.getItemTotal()));
}


function setSubTotal(){
    let disc = $('#txtDiscount').val();
    let first = document.getElementById("totalLbl").textContent;
    let second = (first * disc)/100;
    let third = first - second;
    document.getElementById('subTotalLbl').innerHTML = third + '.00';
 }

function checkStock(buy){

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
    let itom = searchitem(itemCode);
    let newQty =0;
    if(mark === '-'){
        newQty = (Number(itom.getItemQty() - buyQty));
    }else{
        newQty = (Number(itom.getItemQty()) + Number(buyQty));
    }

    let res= itemUpdate(new ItemDTO(itom.getItemCode(), itom.getItemName(), newQty, itom.getItemPrice()));
    if(res){
        ItemSet();
    }
}

function clearAllFields(){
    ItemSet();
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
    TempOrderDetailsList=[];
    clearAllFields();
    custSet()
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