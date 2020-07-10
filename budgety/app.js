//Budget Controller
var budgetController = (function(){

    //Expense Construsctor
    function Expense(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    Expense.prototype.calcPercentage = function(){
        var income = data.totalInc;
        if(income > 0){
            this.percentage = Math.round((this.value / income) * 100);
        } else{
            this.percentage = "---";
        }
    }

    //Income Construsctor
    function Income(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    }   

    // Overall data structure
    var data = {
        allItems: {
            inc: [],
            exp: []
        },
        totalExp : 0,
        totalInc: 0,
        budget: 0,
        percentage: -1
    }

    // calculate total expenses or total incomes
    function total(type){
        var sum = 0;
        data.allItems[type].forEach(function(curr){
            sum += curr.value;
        });
        if(type === 'inc'){
            data.totalInc = sum;
        } else if(type === 'exp'){
            data.totalExp = sum;
        }
        return sum;
    }

    // Calculate the budget
    function budgetCalculater(){
        var calBudget = data.totalInc - data.totalExp;
        data.budget = calBudget;
        return calBudget; 
    }

    // Calculate the gloabl percaentage
    function calculatePercaentage(){
        var calcPercentage;
        if(data.totalInc > 0){
            calcPercentage = Math.round((data.totalExp / data.totalInc * 100)); 
        } else{
            calcPercentage = -1;
        }
        data.percentage = calcPercentage;
        return calcPercentage;
    }

    //calculate the percentage of each expense
    function calculatePercentages(){
        data.allItems.exp.forEach(function(curr){
            curr.calcPercentage();
        });
    }

    return {

        // Method to add item to the data structure
        addItem: function(type, description, value){
            var newItem, id;
             //create an id
            if(data.allItems[type].length > 0){
                id = (data.allItems[type][((data.allItems[type].length) - 1)].id) + 1;
            } else{
                id = 0;
            }
            //create an income object
            if(type === 'inc'){
                newItem = new Income(
                    id,
                    description,
                    value
                );
            } 
             //create an expense object
            else if(type === 'exp'){
                newItem = new Expense(
                    id,
                    description,
                    value
                );
            }
            //push the newItem to the array
            data.allItems[type].push(newItem);
            return newItem;
        },

        //Delete item from the data structure
        delItem: function(type, id){
            var ids, index;
            //Create array of ids
            ids = data.allItems[type].map(function(current){
                return current.id;
            });
            //Find the index of particular item id
            index = ids.indexOf(id);
            //Delete the item from the array on the basis of index
            data.allItems[type].splice(index, '1');
            return 0;
        },

        //calculate the budget
        calculateBudget: function(type){
            total(type);
            budgetCalculater();
            calculatePercaentage();
        },
        //return the budget
        getBudget: function(){
            return{
                totalExpenses: data.totalExp,
                totalIncomes: data.totalInc,
                budget: data.budget,
                percentage: data.percentage
            };
        },

        calcPercentages: function(){
            calculatePercentages();
        },

        //Return the percentages
        getPercentages: function(){
            var percentages = data.allItems.exp.map(function(cur){
                return cur.percentage;
            });

            return percentages;
        },

        testing: function(){
            return data;
        }
    };
})();


//UI Controller
var UIController = (function(){
    var DOMStrings = {
        type: '.add__type',
        description: '.add__description',
        value: '.add__value',
        add__btn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        globalPercentage: '.budget__expenses--percentage',
        container: '.container',
        itemPercentage: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    function nodeListForEach(arr, callback){
        for(var i = 0; i < arr.length; i++){
            callback(arr[i], i);
        }
    }

    return {
        //Reads values form input fields
        inputFieldsGetter: function(){
            return {
                type: document.querySelector(DOMStrings.type).value, // Either will be inc or exp
                description: document.querySelector(DOMStrings.description).value,
                value: parseFloat(document.querySelector(DOMStrings.value).value)
            };
        },

        clearInputFields: function(){
            var fields, newFields;
            //select all the input fields
            fields = document.querySelectorAll(DOMStrings.description + ',' + DOMStrings.value);
            //conver fields list into array
            fields = Array.prototype.slice.call(fields);
            //clear the fields
            fields.forEach(curr => {
                curr.value = '';
            });
            //Give a focus to description input field
            fields[0].focus();
        },

        optionListChange: function(){
            var list, btn;
            list = document.querySelectorAll(
                DOMStrings.type + ',' +
                DOMStrings.description + ',' +
                DOMStrings.value
            );
            nodeListForEach(list, function(cur){
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMStrings.add__btn).classList.toggle('red');
        },

        addItem: function(type, item){
            var html, newHtml;
            //Create the html string with placeholder text
            if(type === 'inc'){
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">+ %value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            else if(type === 'exp'){
                html = '<div class="item clearfix" id="exp-%id%""><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">- %value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            //replace placeholder text
            newHtml = html.replace('%id%', item.id);
            newHtml = newHtml.replace('%description%', item.description);
            newHtml = newHtml.replace('%value%', item.value);
            //insert the html into DOM
            if(type === 'inc'){
                document.querySelector(DOMStrings.incomeContainer).insertAdjacentHTML('beforeend', newHtml);
            } else if(type === 'exp'){
                document.querySelector(DOMStrings.expenseContainer).insertAdjacentHTML('beforeend', newHtml);
            }
        },

        delItem: function(id){
            var el, parent;
            //select the element that want to delete basis on the Id
            el = document.getElementById(id);
            //select the parent of the selected element
            parent = el.parentNode;
            //Remove the child element el from the parent
            parent.removeChild(el);
            //return 0 to indicate the sucess of operation
            return 0;
        },
        // method to update the budget UI
        addBudget: function(el){
            document.querySelector(DOMStrings.budgetLabel).textContent = el.budget;
            document.querySelector(DOMStrings.incomeLabel).textContent = el.totalIncomes;
            document.querySelector(DOMStrings.expenseLabel).textContent = el.totalExpenses;
            if(el.percentage>=0){
                document.querySelector(DOMStrings.globalPercentage).textContent = el.percentage + '%';
            }
            else{
                document.querySelector(DOMStrings.globalPercentage).textContent = "---";
            }
        },

        //Method to update all the percentages in the UI
        addPercentages: function(el){
            var percentages;
            // Select the Node List of all the elements presen in the html
            percentages = document.querySelectorAll(DOMStrings.itemPercentage);
            if(percentages){
                //convert Node list into array
               percentages = Array.prototype.slice.call(percentages);
               //Loop Through array
               var i = 0;
               percentages.forEach(function(curr){
                    curr.textContent = el[i] + '%';
                    i++; 
               });
            }

        },

        //Display the current month and year
        displayDate: function(){
            var year, month, monthList, date;
            monthList = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            date = new Date();
            year = date.getFullYear();
            month = date.getMonth();

            document.querySelector(DOMStrings.dateLabel).textContent = monthList[month] + ' ' + year;
        },
        //Get DOMStrings
        getDomStrings: function(){
            return DOMStrings;
        }
    };

})();

//Global App controller
var controller = (function(budgetCtrl, UICtrl){

    //DOM Strings
    var DOM = UICtrl.getDomStrings();
    //Function to initailize all the events
    function eventSetter(){
        //Mouse Click Event
        document.querySelector(DOM.add__btn).addEventListener("click", ctrlAddItem);
        //Keyboard ENTER Press event
        document.querySelector(DOM.value).addEventListener("keypress", function(event){
            if(event.keyCode === 13){
                ctrlAddItem();
            }
        });

        //Delete item event
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        //Input option list change event
        document.querySelector(DOM.type).addEventListener('change', UICtrl.optionListChange);
    }

    // Update or calculate the budget 
    function budgetUpdate(type){
        // Calculate the budget
        budgetCtrl.calculateBudget(type)
        //return the budget
        var budget = budgetCtrl.getBudget();
        //update the UI
        UICtrl.addBudget(budget);
    }

    // This function will update all the percentages that each expense will cause to total incom
    function percentageUpdate(){
        // calculate the percentages
        budgetCtrl.calcPercentages();
        // Get percentages
        var percentages = budgetCtrl.getPercentages();
        // Update the percentages in the UI
        UICtrl.addPercentages(percentages);
    }

    function ctrlAddItem(){
        //1: Get field values
        var inputs = UICtrl.inputFieldsGetter();

        if(inputs.description !== '' && !isNaN(parseFloat(inputs.value)) && inputs.value > 0 ){
            //2: Store field values to the data structure
            var newItem = budgetCtrl.addItem(inputs.type, inputs.description, inputs.value);
            //3: Clear the input fields
            UICtrl.clearInputFields();
            //4: Update the UI
            UICtrl.addItem(inputs.type, newItem);
            //5: Calculate the budget
            budgetUpdate(inputs.type);
            //6: Update the percentages
            percentageUpdate();
        }  
    }

    function ctrlDeleteItem(event){
        // target the element that we want to delete
        var itemId, idArray, type, id;
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemId){
            idArray = itemId.split('-');
            type = idArray[0];
            id = parseInt(idArray[1]);

            //Delelete the item form the data structure
            budgetCtrl.delItem(type, id);
            //Delete item form the DOM
            UICtrl.delItem(itemId);
            //Update the budget
            budgetUpdate(type);
            //Update the percentages
            percentageUpdate();
        }
    }

    return {
        appInIt: function(){
            //setup the events
            eventSetter();
            //Display date
            UICtrl.displayDate();
            //Clear The Budget UI
            document.querySelector(DOM.budgetLabel).textContent = 0;
            document.querySelector(DOM.incomeLabel).textContent = 0;
            document.querySelector(DOM.expenseLabel).textContent = 0;
            document.querySelector(DOM.globalPercentage).textContent = "---";
        }
    };
})(budgetController, UIController);

controller.appInIt();