//-------------------------------------------------------------------------------------------------
//Budget controller
//-------------------------------------------------------------------------------------------------
var budgetController=(function(){
    //some code
    var Expense= function(id, description,value){
        this.id=id;
        this.description=description;
        this.value=value;
        this.percentage=-1;
    };
    Expense.prototype.calculatePercentages=function(totalIncome){
        if(totalIncome>0){
            this.percentage=Math.round((this.value/totalIncome)*100);   
        }else{
            this.percentage=-1;         
        }
    };
    Expense.prototype.getPercenateg=function(){
      return this.percentage;  
    };
    
    var Income= function(id, description,value){
        this.id=id;
        this.description=description;
        this.value=value;
    };
    
    var data={
        allItems:{
            exp:[],
            inc:[]
        },
        totals:{
            exp:0,
            inc:0
        },
        budget:0,
        percentage:-1
    };
    var calculateTotal=function(type){
        var sum=0;
        data.allItems[type].forEach(function(current){
            sum=sum+current.value;
        });
        data.totals[type]=sum;
    };
    
    return{
        addItem:function(type,des,val){
            var newItem;
            var ID;
            ////--------------------CREATE NEW ID---------------------------------------
            if(data.allItems[type].length>0){
                ID=data.allItems[type][data.allItems[type].length-1].id+1;    
            }else{
                ID=0;
            }
            ////--------------------CREATE NEW ITEM BASED ON INC OR EXP-----------------
            if(type==='exp'){
                newItem=new Expense(ID,des,val);    
            }else if(type==='inc'){
                newItem=new Income(ID,des,val);
            }
            //--------------------PUSH IT INTO OUR DATA STRUCTURE----------------------
            data.allItems[type].push(newItem);
            //--------------------RETURN-----------------------------------------------
            return newItem;
        },
        calculateBudget:function(value,type){
            //1.CALCULATE TOTAL---------------------------------------------------------
                calculateTotal('exp');
                calculateTotal('inc');
            //2.CALCULATE BUDGET : INCOME - EXPENSES------------------------------------
                data.budget=data.totals.inc-data.totals.exp;
            //3.CALCULATE THE PERCENTAGE OF INCOME THAT WE SPENT------------------------
            if(data.totals.inc){
                data.percentage=Math.round((data.totals.exp/data.totals.inc)*100);
            }else{
                data.percentage=-1;
            }    
        },
        calculatePercentages:function(){
            data.allItems.exp.forEach(function(cur){
                cur.calculatePercentages(data.totals.inc);
            });
        },
        
        getPercentages:function(){
            var allPerc=data.allItems.exp.map(function(cur){
                return cur.getPercenateg();
            });
            return allPerc;
        },
        getBudget: function(){
            return{
                budget:data.budget,
                totalInc:data.totals.inc,
                totalExp:data.totals.exp,
                percentage:data.percentage
            }
        },
        deleteItem: function(type,id){
            var ids,index;
            var ids=data.allItems[type].map(function(current){
                return current.id;
            })
            index=ids.indexOf(id);
            if(index !== -1){
                data.allItems[type].splice(index,1);
            }
        },
        test:function(){
            console.log(data);
        }
    };
    
})();











//-------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------
//UI controller
//-------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------
var UIController=(function(){
    var DOMstring={
        inputType: '.add__type',
        inputDescription:'.add__description',
        inputValue:'.add__value',
        inputBtn:'.add__btn',
        incomeContainer:'.income__list',
        expenseContainer:'.expenses__list',
        budgetLabel:'.budget__value',
        incomeLabel:'.budget__income--value',
        expenseLabel:'.budget__expenses--value',
        percentageValue:'.budget__expenses--percentage',
        container:'.container',
        epensesPercLabel:'.item__percentage',
        dateLabel:'.budget__title--month'
    };
    
    var formatNumber=function(num,type){
            var numSplit,int,dec,sign;
            /*
            + OR - BEFORE NUMBER
            EXACTLY 2 DECIMAL NUMBER
            COMMA SEPERATING THE THOUSANDS
            */
            num=Math.abs(num);
            num=num.toFixed(2);
            
            numSplit=num.split('.');
            int=numSplit[0];
            dec=numSplit[1];
            if(int.length>3){
                int=int.substr(0,int.length-3)+','+int.substr(int.length-3,3);
            }
            if(type==='exp'){
                sign='-';
            }else{
                sign='+';
            }
            return sign+' '+ int+ '.'+dec;
        };
    
    //some Code
    return{
        //----------
        getinput:function(){
            return{
                type: document.querySelector(DOMstring.inputType).value,//inc and exp
                description: document.querySelector(DOMstring.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstring.inputValue).value)
            };
        },
        addListItem:function(obj,type){
            //1. CREATE HTML STRING AND PLACEHOLDER TAG
            var html,newHtml,element;
            if(type==='inc'){
                element=DOMstring.incomeContainer;
                html='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }else if(type==='exp'){
                element=DOMstring.expenseContainer;
                html='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';                
            }
            //2.REPLACE THE PLACEHOLDER TEXT WITH SOME ACTUAL DATA
            newHtml=html.replace('%id%',obj.id);
            newHtml=newHtml.replace('%description%',obj.description);
            newHtml=newHtml.replace('%value%',formatNumber(obj.value,type));
            //3.INSERT THE HTML FILE
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
            
        },
        //----------
        clearFeilds:function(){
            var feilds;
            feilds=document.querySelectorAll(DOMstring.inputDescription+', '+DOMstring.inputValue);
            var feildsArray=Array.prototype.slice.call(feilds);
            feildsArray.forEach(function(current,index,array){
                current.value="";
            });
            feildsArray[0].focus();
        },
        displayBudget:function(obj){
            var type;
            if(obj.budget>0){
                type='inc';
            }else{
                type='exp';
            }
            document.querySelector(DOMstring.budgetLabel).textContent=formatNumber(obj.budget,type);
            document.querySelector(DOMstring.incomeLabel).textContent=formatNumber(obj.totalInc ,type);;
            document.querySelector(DOMstring.expenseLabel).textContent=formatNumber(obj.totalExp,type);
            if(obj.percentage>0){
                document.querySelector(DOMstring.percentageValue).textContent=obj.percentage+"%";
            } else{
                document.querySelector(DOMstring.percentageValue).textContent="---";
            }
        },
        //----------
        deleteListItem:function(selectorID){
            var el=document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        //----------
        displayPercentages:function(percentages){
            var fields=document.querySelectorAll(DOMstring.epensesPercLabel);
            var NodeListForEach=function(list,callback){
                for(var i=0;i<list.length;i++){
                    callback(list[i],i);
                }
            };
            NodeListForEach(fields,function(current,index){
                current.textContent=percentages[index]+'%';
            });
        },
        //----------
        displayMonth: function(){
            var now,year,month,day,months;
            months=['Jan','Feb','March','April','May','June','July','Aug','Sep','Oct','Nov','Dec'];
            now=new Date();
            month=now.getMonth();
            year =now.getFullYear();
            document.querySelector(DOMstring.dateLabel).textContent=months[month]+' /'+year;
            
        },
        //----------
        getDOMstring:function(){
            return DOMstring;
        }
        
    };
})();










//-------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------
//global app controller
//-------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------
var controller=(function(budgetCtrl,UICtrl){
    
    //--------------------EVENT LISTENERS---------------------------------------------
    var setupEventListener=function(){
        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);
    
        document.addEventListener('keypress',function(event){
            if(event.keyCode===13){
                ctrlAddItem();    
            } 
        });
        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
    }
    //---------------------UPDATE BUDGET--------------------------------------------------
    var updateBudget=function(){
        //1.CALCULATE THE BUDGET-----------------------------------------
            budgetCtrl.calculateBudget();
        //2.RETURN THE BUDGET--------------------------------------------
            var budget=budgetCtrl.getBudget();
            
        //3.DISPLAY THE BUDGET ON THE UI--------------------------------
            UICtrl.displayBudget(budgetCtrl.getBudget())
    };
    
    //----------------------UPDATE PERCENTAGE--------------------------------------------------
    var updatePercentage=function(){
        //1. CALCULATE THE PERCENTAGE
        budgetCtrl.calculatePercentages();
        //2.READ THE PERCENTAGE FROM THE BUDGET CONROLLER
        var percentages=budgetCtrl.getPercentages();
        //3.UPDATE THE UI WITH THE NEW PERRCENTAGES
        UICtrl.displayPercentages(percentages);
    };
    
    //---------------------HTML CLASS AND IDS------------------------------------------------------
    var DOM=UICtrl.getDOMstring();
    //---------------------------------------------------------------------------------------------
    var ctrlAddItem=function(){
        var input,newItem;
       //1.get the the input data
            input=UICtrl.getinput();
            if(input.description!=="" && !isNaN(input.value) && input.value > 0){
            //2.add the item to the budget controller
                newItem=budgetCtrl.addItem(input.type,input.description,input.value);
            //3.add the item to the UI
                UICtrl.addListItem(newItem,input.type);
            //4.calculate the budget
                UICtrl.clearFeilds();

            //5.display the budget on the UI
                updateBudget();     
                
            //6.calculate and update percentages
                updatePercentage();
            }
    }
    
    //--------------------------------------------------------------------------------------------
    //-----------------------------DELETE---------------------------------------------------------
    //--------------------------------------------------------------------------------------------
    var ctrlDeleteItem=function(event){
        var itemID,splitID,type,ID;
        itemID=event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID){
            splitID=itemID.split("-");
            type=splitID[0];
            ID=parseInt(splitID[1]);
            
            //1.DELETE THE ITEM FROM DATA STRUCTURE
                budgetCtrl.deleteItem(type,ID);
            //2.DELETE THE ITEM FROM UI
                UICtrl.deleteListItem(itemID);
            //3.UPDATE AND SHOW THE NEW BUDGET
                updateBudget();
            //4. UPDATE THE PERCENTAGES
                updatePercentage();
            
        }
    };
    
    //------------------------------RETURN---------------------------------------------------------
    return{
        //--------------this is executing the code-------------------------------------------------
        init: function(){
            console.log('the application have been started.');
            UICtrl.displayMonth();
            UICtrl.displayBudget(budgetCtrl.getBudget());
            setupEventListener();
        }
    };
    
})(budgetController,UIController);


controller.init();