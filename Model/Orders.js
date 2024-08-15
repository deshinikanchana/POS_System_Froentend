function OrderDTO(orderId,cusId,orderDate,orderTotal,discount,subTotal,cash,balance){
    
    var orderId = orderId;
    var cusId = cusId;
    var orderDate=orderDate;
    var orderTotal = orderTotal;
    var discount = discount;
    var subTotal =subTotal;
    var cash = cash;
    var balance = balance;

    this.getOrderId=function(){
        return orderId;
    }

    this.getCusId=function(){
        return cusId;
    }

    this.getOrderDate=function(){
        return orderDate;
    }
    
    this.getOrderTotal=function(){
        return orderTotal;
    }

    this.getDiscount=function(){
        return discount;
    }

    this.getSubTotal=function(){
        return subTotal;
    }

    this.getCash=function(){
        return cash;
    }

    this.getBalance=function(){
        return balance;
    }



    this.setOrderId = function(newOId){
        orderId=newOId;
    }

    this.setCusId = function(newCusId){
        cusId=   newCusId;
    }

    this.setOrderDate = function(newOrderDate){
        orderDate=   newOrderDate;
    }

    this.setOrderTotal=function(newOrderTotal){
        orderTotal= newOrderTotal;
    }

    this.setDiscount = function(newDiscount){
        discount=newDiscount;
    }

    this.setSubTotal=function(newSubTotal){
        subTotal=newSubTotal;
    }

    this.setCash = function(newCash){
        cash=newCash;
    }

    this.setBalance=function(newBalance){
        balance=newBalance;
    }
}