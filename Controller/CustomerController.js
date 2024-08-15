let isvalid = false;
let idVal = false;
let nameVal = false;
let salVal = false;
let count1;
let Custcount = $('#tblCustomers').find('tr').length;
let TargetCus=[];

$('#custBtn').click(function (event) {
    $('#txtCustId').focus();
    clearAllCust();
    loadAllCustomerToTheTable();
});


// ---------------------------------------------------------------------Save Customer---------------------------------------------------------------------
$('#btnAddCust').click(function (event) {

    let id=$('#txtCustId').val();
    let name = $('#txtName').val();
    let address = $('#txtAddress').val();
    let salary = $('#txtSalary').val();
    
    if((id.length > 1) & (name.length > 1)){
       
        if((idVal) & (salVal) & (nameVal)){
             isvalid =true;
         }

         isAvailableCus(id);

        if(isvalid){
            const customData = {
                cusId:id,
                cusName:name,
                cusAddress:address,
                cusSalary:salary
            };


            const custJSON = JSON.stringify(customData)
            
            $.ajax({
                url:"http://localhost:8080/Pos_System_App/customer",
                type: "POST",
                data:custJSON,
                headers:{"Content-Type" : "application/json"},
                success: (res)=>{
                    //console.log(JSON.stringify(res));
                    customerTable.push(customData);
                    clearAllCust();
                },
                error:(res)=>{
                    console.log("res :" + res)
                }
            })
        Custcount = Custcount+1;
        }

}else{
    alert('Fill Fields First !')
    event.preventDefault()
}
});

function isAvailableCus(id){
    $.ajax({
        url:"http://localhost:8080/Pos_System_App/customer",
        type: "GET",
        data:{"cusId": id},
        headers:{"Content-Type" : "application/json"},
        success: (res)=>{
            //console.log(JSON.stringify(res));   
          
            var values = Object.keys(res).map(function (key){
                return res[key];
            })

          if(values[1] != id){
            return false;
          }
          alert("This ID Already Added !!!")
        },
        error:(res)=>{
            console.log("res :" + res)
           
        }
    })
}

// ---------------------------------------------------------------------clear Fields ---------------------------------------------------------------------

$('#btnClearCust').click(function(){
    clearAllCust();
     var custText = document.getElementById('txtCustId');
     custText.disabled = false;
     loadAllCustomerToTheTable();
});

// ---------------------------------------------------------------------Get Customer Details---------------------------------------------------------------------

$('#btnGetAllCust').click(function(){
    searchCustomer($("#txtCustId").val());
});

function searchCustomer(id) {
    if(id.length > 1){
        $.ajax({
            url:"http://localhost:8080/Pos_System_App/customer?cusId=" + `${id}`,
            type: "GET",
            headers:{"Content-Type" : "application/json"},
            success: (res)=>{
                //console.log(JSON.stringify(res));   
              
                var values = Object.keys(res).map(function (key){
                    return res[key];
                })
               var newData = new CustomerDTO(values[1],values[2],values[0],values[3]);
               if (newData != null){
                    $("#txtCustId").val(newData.getCustomerId());
                    $("#txtName").val(newData.getCustomerName());
                    $("#txtAddress").val(newData.getCustomerAddress());
                    $("#txtSalary").val(newData.getCustomerSalary());
            
                    var custText = document.getElementById('txtCustId');
                    custText.disabled = true;
                }else {
                alert("Customer Not Found !");
                customerTable = [];
                clearAllCust();
                }
            },
            error:(res)=>{
                console.log("res :" + res)
               
            }
        })

    } else{
        alert('Enter a Customer Id !')
    }
}

// ---------------------------------------------------------------------Update Customer---------------------------------------------------------------------

$("#btnUpdateCust").click(function () {
    let id = $("#txtCustId").val();
    let name = $("#txtName").val();
    let address = $("#txtAddress").val();
    let salary = $("#txtSalary").val();

    let option = confirm(`Do you want to Update Customer ID: ${id}`);
    if (option) {
        const customerData = {
            cusName: name,
            cusAddress: address,
            cusSalary: salary
        };

        $.ajax({
            url: "http://localhost:8080/Pos_System_App/customer?cusId=" + `${id}`,
            type: "PUT",
            data: JSON.stringify(customerData),
            headers: { "Content-Type": "application/json" },
            success: (resp) => {
               // console.log(JSON.stringify(resp));

                let custData = searchcustomer(id);
                if(custData != null){
                    custData.setCustomerName(name);
                    custData.setCustomerAddress(address);
                    custData.setCustomerSalary(salary);
                }
                alert("Customer Updated Successfully");
                clearAllCust();
                
            },
            error: (jqXHR, textStatus, errorThrown) => {
                console.log("Error: " + textStatus + ", " + errorThrown);
                console.log("Response: ", jqXHR.responseText);
                alert("Update Failed: " + jqXHR.responseText);
            }
        });

    }
});

// ---------------------------------------------------------------------Delete Customer---------------------------------------------------------------------

    $("#btnDeleteCust").click(function (){
        var id = $('#txtCustId').val();
        if($('#txtCustId').val().length > 1){
        let option=confirm(`Do you want to delete ID:${id}`);

        if (option){
            $.ajax({
                url:"http://localhost:8080/Pos_System_App/customer?cusId=" + `${id}`,
                type: "DELETE",
                headers:{"Content-Type" : "application/json"},
                success: (res)=>{
                    //console.log(JSON.stringify(res)); 
                    alert("Customer Deleted");
                    Custcount = Custcount-1;
                    var custText = document.getElementById('txtCustId');
                    custText.disabled = false;
                    let customer = searchCustomer(id);
                    if (customer != null) {
                        let indexNumber = customerTable.indexOf(customer);
                        customerTable.splice(indexNumber, 1);
                        return true;
                    }
                    clearAllCust();
                },
                error:(res)=>{
                    console.log("res :" + res)
                    alert("Customer Delete Failed")
                    return null; 
                }
            });
        }
    }
});

 // ---------------------------------------------------------------------Functions---------------------------------------------------------------------


$('#customerTable').on('click', 'tr', function(e){
    tableText($(this).html());
});
  
function tableText(tableRow) {
    var myJSON = JSON.stringify(tableRow);
    searchCustomer(myJSON.slice(5,12));
  }


  
function loadAllCustomerToTheTable() {
    getAllCustomers();
}

function searchcustomer(code){
    for (var i in customerTable){
        if (customerTable[i].getCustomerId()==code) return customerTable[i];
    }
    return null;
}

 function getAllCustomers() {
    customerTable =[];
    var AllCustomersData =[];
    $.ajax({
        url:"http://localhost:8080/Pos_System_App/customer",
        type: "GET",
        headers:{"Content-Type" : "application/json"},
        success: (res)=>{
           // console.log(JSON.stringify(res));  

            for(let i =0;i<res.length;i++){
                let myOne = res[i];
                var AllValues = Object.keys(myOne).map(function (key){
                    return myOne[key];

                })

                AllCustomersData.push(new CustomerDTO(AllValues[1],AllValues[2],AllValues[0],AllValues[3]));
                setCusVals(AllCustomersData[i]);
                $('#tblCustomers').empty();
                for (let j =0;j<AllCustomersData.length;j++) {
                    let id = AllCustomersData[j].getCustomerId();
                    let name = AllCustomersData[j].getCustomerName();
                    let address = AllCustomersData[j].getCustomerAddress();
                    let salary = AllCustomersData[j].getCustomerSalary();


        var row = `<tr><td>${id}</td><td>${name}</td><td>${address}</td><td>${salary}</td></tr>`;
        $('#tblCustomers').append(row);
    }
            }
            count1 = AllCustomersData.length;
        },
        error:(res)=>{
            console.log("res :" + res)
            return null;
        }
    })
 }


function setCusVals(cusDto){
        customerTable.push(new CustomerDTO(cusDto.getCustomerId(),cusDto.getCustomerName(),cusDto.getCustomerAddress(),cusDto.getCustomerSalary()))
}


function clearAllCust() {
    customerTable = [];
    $('#txtCustId').val('');
    $('#txtName').val('');
    $('#txtAddress').val('');
    $('#txtSalary').val('');
    $('#txtCustId').focus();
    $("#custId").text("");
    $("#custnam").text('');
    $("#custSal").text('');
    normalAll();
    loadAllCustomerToTheTable();


}

function normalAll(){
    $("#txtCustId").css('border','2px solid grey');
    $("#txtSalary").css('border','2px solid grey');
    $("#txtAddress").css('border','2px solid grey');
    $("#txtName").css('border','2px solid grey');
}


// ---------------------------------------------------------------------Validations---------------------------------------------------------------------

let cusIdReg=/^((C00-)[0-9]{2,100})/;
let cusSalReg =/^[0-9]{4,10}/;
let cusNameReg =/^[A-Z][a-z]{3,}/;

 $("#txtCustId").on('keyup',function (event){
      if (event.key=="Enter"){
          $('#txtName').focus();
      }


    if (cusIdReg.test($("#txtCustId").val())){
        $("#txtCustId").css('border','2px solid green');
        $("#custId").text("");
        let available = isAvailableCus($("#txtCustId").val());
        if(!available){
        idVal = true;
        
        }else{
            $("#custId").text("This Id Already Added");
            idVal=false;
        }
    }else{
        $("#txtCustId").css('border','2px solid red');
        $("#custId").text('Your Input Data Format is Invalid (C00-001)');
        idVal=false;
    }
 });


 $("#txtName").on('keyup',function (event){
     if (event.key=="Enter"){
         $('#txtAddress').focus();
     }

    if (cusNameReg.test($("#txtName").val())){
        $("#txtName").css('border','2px solid green');
        $("#custnam").text('');
        nameVal= true;
    }else{
        $("#txtName").css('border','2px solid red');
        $("#custnam").text('Your Input Data Format is Invalid (Abcde)');
        nameVal=false;
    }
 });

 $("#txtSalary").on('keyup',function (event){
     if (event.key=="Enter"){
         $('#btnAddCust').focus();
     }

    if (cusSalReg.test($("#txtSalary").val())){
        $("#txtSalary").css('border','2px solid green');
        $("#custSal").text(' ');
        salVal= true;
    }else{
        $("#txtSalary").css('border','2px solid red');
        $("#custSal").text('Your Input Data Format is invalid (salary > 1000)');
        salVal=false;
    }
});

$("#txtAddress").on('keyup',function (event) {
    if (event.key == "Enter") {
        $('#txtSalary').focus();
    }
});

$("#btnAddCust").on('keyup',function (event) {
    if (event.key == "Enter") {
        $('#btnClearCust').focus();
    }
});


$('#txtCustId,#txtName,#txtAddress,#txtSalary').on('keydown',function (event){
    if (event.key=="Tab"){
        event.preventDefault();
    }
});
