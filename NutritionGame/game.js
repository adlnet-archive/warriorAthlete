function FoodServing(item, servings) {
    this.servings = servings || 1;
    this.food = item;
}

//a class to hold the current state of the plate, and all items on it
var currentPlate = {
    items: [],
    //sum up all the macronutirents
    getTotals: function() {
        var cals = 0;
        var fat = 0;
        var salt = 0;
        var protein = 0;
        var carbs = 0;
        var local = 0;
        for (var i = 0; i < this.items.length; i++) {
            var servings = this.items[i].servings;
            cals += this.items[i].food.cals * servings;
            salt += this.items[i].food.salt * servings;
            fat += this.items[i].food.fat * servings;
            protein += this.items[i].food.protein * servings;
            carbs += this.items[i].food.carbs * servings;
            local += this.items[i].food.local * servings;
        }
        return {
            carbs: carbs,
            cals: cals,
            fat: fat,
            salt: salt,
            protein: protein,
            local: local
        };
    },
    //find a serving on the plate by its guid
    findItem: function(id) {
        for (var i in this.items)
            if (this.items[i].id == id)
                return i;
        return -1;
    },
    //remove a serving from the plate by its GUID
    removeItem: function(id) {

        var index = this.findItem(id);
        if (index) {
            this.items.splice(index, 1);
            $('#' + id).hide('fade', function() {
                $('#' + id).remove();
            })
            $('#' + id + 'preview').hide('slide', function() {
                $('#' + id + 'preview').remove();
            })
        }
        gameManager.updateCharts();
    },
    //load a plate from JSON
    loadPlate: function(platename) {
        this.clearPlate();
        $.getJSON("./vwfDataManager.svc/datafile/NutritionGame/plates/" + platename, function(data) {

            for (var i in data) {
                currentPlate.addItem(allFoods.get(data[i]));
            }


        });
    },
    //clear the plate
    clearPlate: function() {
        while (this.items.length) {
            this.removeItem(this.items[0].id);
        }
    },
    //add an item, and do all the GUI work
    addItem: function(foodItem, servings) {

        //create a serving from the item
        var newFood = new FoodServing(foodItem, servings);
        this.items.push(newFood);

        //create a GUID for the serving
        var guid = ToSafeID(GUID());
        newFood.id = guid;

        ///Append a new div to the platecontainer This div will be the draggable 
        $('#plateContainer').append('<img id="' + guid + '"src = "' + foodItem.thumbnail + '" class="foodthumb"> </img>');
        $('#' + guid).css('top', (Math.random() * 60 + 0) + '%');
        $('#' + guid).css('left', (Math.random() * 60 + 0) + '%');
        $('#' + guid).draggable({
            containment: "parent",
            stack: ".foodthumb"
        });

        //hilight the entry in the plate list
        $('#' + guid).mouseover(function() {
            $('#' + guid + 'preview').addClass('platePreviewItemHilight');
        })

        $('#' + guid).mouseout(function() {
            $('#' + guid + 'preview').removeClass('platePreviewItemHilight');
        })

        //append an entry into the plate list as well
        $('#platePreview').append('<div class="platePreviewItem" linkedTo="' + guid + '" id="' + guid + 'preview">' +
            '<img src="' + foodItem.thumbnail + '"> ' +

            foodItem.name +
            "<span class='closebutton' linkedTo='" + guid + "' id='" + guid + "delete'>X</span>" +
            '</div>');

        //when the delete button for the entry in the list is clicked
        $('#' + guid + 'delete').click(function() {
                var link = $(this).attr('linkedTo');
                currentPlate.removeItem(link);
            })
            //Hilight the food on the plate when mouse over on the list
        $('#' + guid + 'preview').mouseover(function() {
            var link = $(this).attr('linkedTo');
            $('#' + link).addClass('hilight');
        });
        $('#' + guid + 'preview').mouseout(function() {
            var link = $(this).attr('linkedTo');
            $('#' + link).removeClass('hilight');
        });
        gameManager.updateCharts();
    }

}

//a type of food. Can be put on a plate as part of a serving
//This links together the logical data about nutrition, and the VWF simulation environment
function FoodType(id, name, thumb, cals, fat, salt, carbs, protein, local) {
    this.id = id;
    this.name = name;
    this.carbs = carbs;
    this.fat = fat;
    this.cals = Math.floor(fat * 9 + carbs * 4 + protein * 4);
    this.salt = salt;
    this.protein = protein;
    this.local = local;

    //thumbnail image
    this.thumbnail = './vwfDataManager.svc/datafile/NutritionGame/assets/2D_Portions/' + thumb;
    this.getPosition = function() {
        return vwf.getProperty(this.id, 'worldPosition');
    }

    //Get the position in screen space for the VWF object that is the graphic for this food
    this.getPositionScreenSpace = function() {
            var position = this.getPosition();

            var pos = position;
            pos = [pos[0], pos[1], pos[2], 1];

            var _viewProjectionMatrix = new THREE.Matrix4();
            _viewProjectionMatrix.multiplyMatrices(_dView.getCamera().projectionMatrix, _dView.getCamera().matrixWorldInverse);
            vp = _viewProjectionMatrix.transpose().toArray([]);

            var screen = MATH.mulMat4Vec4(vp, pos);
            screen[0] /= screen[3];
            screen[1] /= screen[3];

            screen[0] /= 2;
            screen[1] /= 2;
            screen[2] /= 2;
            screen[0] += .5;
            screen[1] += .5;


            screen[0] *= $(window).width();
            screen[1] *= $(window).height();

            screen[1] = $(window).height() - screen[1];
            return screen;
        }
        //Light up the material of the 3D model
    this.hilight = function(node) {
            if (!node)
                node = _Editor.findviewnode(this.id);
            if (node && node.material) {
                node.material.emmssiveBack = node.material.emissive.clone();
                node.material.emissive.r = 1;
                node.material.emissive.g = 1;
                node.material.emissive.b = 1;
            }
            for (var i in node.children)
                this.hilight(node.children[i])
        }
        //un liight the material for the 3d model
    this.dehilight = function(node) {
            if (!node)
                node = _Editor.findviewnode(this.id);
            if (node && node.material) {

                node.material.emissive.r = node.material.emmssiveBack.r;
                node.material.emissive.g = node.material.emmssiveBack.g;
                node.material.emissive.b = node.material.emmssiveBack.b;
            }
            for (var i in node.children)
                this.dehilight(node.children[i])
        }
        //hide the food from the line
    this.hide = function(node) {
            if (!node)
                node = _Editor.findviewnode(this.id);
            if (node && node.material) {
                node.visibleBack = node.visible;
                node.visible = false;
            }
            for (var i in node.children)
                this.hide(node.children[i])
        }
        //show the food on the line
    this.show = function(node) {
        if (!node)
            node = _Editor.findviewnode(this.id);
        if (node && node.material) {

            node.visible = node.visibleBack;
        }
        for (var i in node.children)
            this.show(node.children[i])
    }
}

// hold a reference to the tray object in the VWF
var tray = new FoodType("asset-vwf-420c9d0b-b6e2-e4d7-6484-d7666b20289f", 'Tray');

//a list of all existing foods that can be choosen
var allFoods = {

    lib: {},
    add: function(foodType) {
        this.lib[foodType.id] = foodType;
    },
    get: function(id) {
        return this.lib[id];
    },
    isFood: function(id) {
        if (this.lib[id])
            return true;
        return false;
    }
}

//set up all the possilbe foods, linking the vwf object, the name, the nutrition stats and the thumbnail
allFoods.add(new FoodType('plane2-vwf-7a0f13ec-fca-ecd-3168-3b8be22fcc0e', 'Onions', 'Salad-Onions.png', 10, 0, 0, 2.5, 0));
allFoods.add(new FoodType('plane2-vwf-3a7543b9-401e-74b2-9982-76fcd707463', 'Cut Carrots', 'Salad-Carrots.png', 55, 0.3, 90, 12.8, 1.2));
allFoods.add(new FoodType('plane2-vwf-4c641bf7-3111-6336-e87f-1b907039ccfa', 'Tomatos', 'Salad-CherryTomatoes.png', 8, 0, 0, 1.7, 0));
allFoods.add(new FoodType('asset-vwf-362e3059-ef81-6442-ada3-8eccf0ccc4f3', 'Sliced Cucumber', 'Salad-Cucumber.png', 4, 0, 0, 0.9, 0));
allFoods.add(new FoodType('plane2-vwf-d5faef9a-28cc-3e7b-c39-a57f5c067cbd', 'Spinach', 'Salad-Lettuce.png', 30, 0, 360, 4, 2));
allFoods.add(new FoodType('plane2-vwf-534d2e05-f844-645c-eb39-dc65d58391db', 'Kale', 'Salad-Lettuce.png', 204, 13.9, 428, 13.9, 6.5));
allFoods.add(new FoodType('plane2-vwf-802a120a-49ae-7daf-6de8-16eaf97124f0', 'Lettuce', 'Salad-Lettuce.png', 8, 0.1, 6, 1.6, 0.5));
allFoods.add(new FoodType('asset-vwf-43451d26-ff8c-d94e-4aad-c0a7a3721d1f', 'Chocolate Pie', 'ChocolatePie.png', 760, 54, 330, 66, 6));
allFoods.add(new FoodType('asset-vwf-10c81564-6623-833e-67e6-4cff29f53af1', 'Glazed Doughnuts', 'Doughnut.png', 240, 11, 95, 33, 2));
allFoods.add(new FoodType('asset-vwf-25d56d7-12c2-caaa-1a5d-e8fec8e621e1', 'Cheesecake', 'Cheesecake.png', 257, 18, 166, 20.4, 4.4));
allFoods.add(new FoodType('asset-vwf-a8e72f29-ee03-724-3d50-50982db81123', 'Cheeseburger', 'Cheeseburger.png', 300, 12, 680, 33, 15));
allFoods.add(new FoodType('plane2-vwf-6a1a70ce-8b00-ad1c-6aed-ee7d4f45eecb', 'Lasagna', 'Lasagna.png', 408, 22.1, 751, 27.4, 25.1));
allFoods.add(new FoodType('plane2-vwf-e704d12b-8bc-cfd9-2286-221ffdb283ef', 'Beans', 'BakedBeans.png', 140, 1, 550, 29, 6));
allFoods.add(new FoodType('asset-vwf-93189cea-a3b1-8160-b606-84a599dab9b5', 'Grilled Chicken', 'GrilledChicken.png', 220, 7, 730, 0, 40));
allFoods.add(new FoodType('plane2-vwf-254a7107-cf0a-fd0b-36dd-5e1b4be357d8', 'Eggs', 'ScrambledEggs.png', 154, 10, 148, 1.6, 13.6));
allFoods.add(new FoodType('plane2-vwf-14923032-3f93-5123-582f-23907fbefad5', 'Stew', 'YankeePotRoast.png', 300, 8, 930, 38, 18));
allFoods.add(new FoodType('asset-vwf-fa1eae88-6b19-3d08-b797-abdbfd93b1f0', 'Bratwurst', 'Bratwurst.png', 283, 24.8, 719, 2.4, 11.7));
allFoods.add(new FoodType('asset-vwf-402f6d1c-2ff-d5fa-b3d4-402e5c9f815', 'Turkey and Gravy', 'SlicedTurkey.png', 240, 11, 550, 20, 15));
allFoods.add(new FoodType('asset-vwf-30c8a4ed-2b45-fa8e-9e9e-dd8c61f5b692', 'Fried Chicken', 'Fried Chicken.png', 120, 6.7, 44, 0.8, 13.2));
allFoods.add(new FoodType('asset-vwf-a39b7a43-5a72-4cab-6c14-dac3a0735b9f', 'Baked Potatoes', 'BakedPotato.png', 278, 0.4, 30, 63.2, 7.5));
allFoods.add(new FoodType('plane2-vwf-e19dd54b-f1e1-b87a-e9b3-a1bddf7c4bc', 'Macaroni', 'Mac-Cheese.png', 200, 6, 1027, 28.1, 8.2));
allFoods.add(new FoodType('plane2-vwf-cc3d7fc5-e9cf-c195-9a8c-4fe4860fa88', 'Eggplant Parm', 'Eggplant Parm.png', 950, 56, 1250, 76, 32));
allFoods.add(new FoodType('plane2-vwf-d8ee41a-480-9926-490d-54948dbfb377', 'Mashed Potatos', 'MashedPotatoes.png', 237, 11.8, 697, 31.5, 4));
allFoods.add(new FoodType('plane2-vwf-22001381-dc4a-94a7-324c-25acaa51da4d', 'Spaghetti', 'SpaghettiSingle.png', 255, 2.9, 473, 43.1, 14.3));
allFoods.add(new FoodType('plane2-vwf-aa52b080-c338-dde8-693b-77d2666abe1', 'Brown Rice', 'WildRice.png', 166, 0.6, 5, 35, 6.5));
allFoods.add(new FoodType('plane2-vwf-d1387ed7-c89c-e3aa-ddea-da14a16ee580', 'White Rice', 'Steamed_Rice.png', 242, 0.4, 0, 53.2, 4.4));
allFoods.add(new FoodType('asset-vwf-ad70b7e8-d5fc-81cc-fa94-3c1ab974cf6f', 'Broccoli', 'Broccoli.png', 55, 0.6, 64, 11.2, 3.7));
allFoods.add(new FoodType('asset-vwf-63f22a47-86ac-2a61-1f40-82bb5f988ac9', 'Carrots', 'CutCarrots.png', 3, 0.1, 5, 0.7, 0.1));
allFoods.add(new FoodType('asset-vwf-ccfffe81-c102-6db1-36e1-9c5b3148f5e9', 'Corn on Cob', 'CornCob.png', 59, 0.5, 3, 14.1, 2));
allFoods.add(new FoodType('asset-vwf-7b6f8613-7c4f-adc5-b0d5-5efbb74b4fe', 'Green Beans', 'GreenBeans.png', 44, 0.4, 1, 9.9, 2.4));
allFoods.add(new FoodType('asset-vwf-f9a2374c-221c-4e17-d321-c06f7f0c863b', 'Bananas', 'Banana.png', 105, 0.4, 1, 27, 1.3));
allFoods.add(new FoodType('asset-vwf-927ec08b-956c-6e56-adfe-653ca0d46e49', 'Green Apples', 'GreenApple.png', 53, 0.2, 1, 14.1, 0.3));
allFoods.add(new FoodType('asset-vwf-78463c0-3d2d-3f58-2d61-9aac3201809d', 'Cornbread', 'Cornbread.png', 160, 3, 330, 30, 2));
allFoods.add(new FoodType('asset-vwf-be12dd76-4923-ffd8-f147-8220b9e75a2e', 'Breads', 'Criossant.png', 231, 12, 424, 26.1, 4.7));
allFoods.add(new FoodType('asset-vwf-f52d3dd3-2bcf-8981-f571-6cde48886998', 'Bread Roll', 'BreadRoll.png', 78, 1.6, 134, 13, 2.7));

var GameMode = function(id,nicename,instructions,scoreFunc)
{
    this.id = id;
    this.nicename = nicename;
    this.instructions = instructions;
    this.scoreFunc = scoreFunc;
    this.displayInstructions = function()
    {
        ('#loadinText1').text(this.instructions);
    }
}

var CALS_PER_PROTEIN_GRAM = 4;
var CALS_PER_FAT_GRAM = 9;
var CALS_PER_CARB_GRAM = 4;

var PROPER_PROTEIN_MIN_PERCENT = 0.2;
var PROPER_PROTEIN_MAX_PERCENT = 0.4;

var PROPER_CARB_MIN_PERCENT = 0.5;
var PROPER_CARB_MAX_PERCENT = 0.7;

var PROPER_FAT_MIN_PERCENT = 0.0;
var PROPER_FAT_MAX_PERCENT = 0.2;


var MAX_CAL_POINTS_PER_STEP = 1;
var CAL_POINT_STEP_SIZE = 16;

var START_CAL_SCORE = 25;
var START_PRO_SCORE = 25;
var START_CARB_SCORE = 25;
var START_FAT_SCORE = 25;

var POINTS_PER_PRO_PERCENT = 1.0;
var POINTS_PER_CARB_PERCENT = 0.5;
var POINTS_PER_FAT_PERCENT = 5.0;
var GoalMode = function(id,nicename,instructions,max_calories)
{
    this.max_calories = max_calories;
    this.evaluateGoal = function()
    {
        var stats = currentPlate.getTotals();
        var calScore = START_CAL_SCORE;
        if(stats.cals > this.max_calories)
        {
            var extraCals = stats.cals - this.max_calories;
            calScore -= MAX_CAL_POINTS_PER_STEP * Math.floor(extraCals/CAL_POINT_STEP_SIZE)
        }
        
        var proScore = START_PRO_SCORE;
        var proRangeMin = stats.cals * PROPER_PROTEIN_MIN_PERCENT ;
        var proRangeMax = stats.cals * PROPER_PROTEIN_MAX_PERCENT ;
        var plateProCals = stats.protein * CALS_PER_PROTEIN_GRAM;
        var proOutOfBoundPercent = 0.0;
        if(plateProCals > proRangeMax)
        {
            proOutOfBoundPercent = 100 * (plateProCals - proRangeMax)/(proRangeMax - proRangeMin);
        }
        if(plateProCals < proRangeMin)
        {
            proOutOfBoundPercent = 100 * (proRangeMin - plateProCals)/(proRangeMax - proRangeMin);
        }
        proScore -= Math.min(START_PRO_SCORE,proOutOfBoundPercent * POINTS_PER_PRO_PERCENT);


        var carbScore = START_CARB_SCORE;
        var carbRangeMin = stats.cals * PROPER_CARB_MIN_PERCENT ;
        var carbRangeMax = stats.cals * PROPER_CARB_MAX_PERCENT ;
        var plateCarbCals = stats.carbs * CALS_PER_CARB_GRAM;
        var carbOutOfBoundPercent = 0.0;
        if(plateCarbCals > carbRangeMax)
        {
            carbOutOfBoundPercent = 100 * (plateCarbCals - carbRangeMax)/(carbRangeMax - carbRangeMin);
        }
        if(plateCarbCals < carbRangeMin)
        {
            carbOutOfBoundPercent = 100 * (carbRangeMin - plateCarbCals)/(carbRangeMax - carbRangeMin);
        }
        carbScore -= Math.min(START_CARB_SCORE,carbOutOfBoundPercent * POINTS_PER_CARB_PERCENT);


        var fatScore = START_FAT_SCORE;
        var fatRangeMin = stats.cals * PROPER_FAT_MIN_PERCENT ;
        var fatRangeMax = stats.cals * PROPER_FAT_MAX_PERCENT ;
        var plateFatCals = stats.fat * CALS_PER_FAT_GRAM;
        var fatOutOfBoundPercent = 0.0;
        if(plateFatCals > fatRangeMax)
        {
            fatOutOfBoundPercent = 100 * (plateFatCals - fatRangeMax)/(fatRangeMax - fatRangeMin);
        }
        if(plateFatCals < fatRangeMin)
        {
            fatOutOfBoundPercent = 100 * (fatRangeMin - plateFatCals)/(fatRangeMax - fatRangeMin);
        }
        fatScore -= Math.min(START_FAT_SCORE,fatOutOfBoundPercent * POINTS_PER_FAT_PERCENT);

        var score = fatScore + carbScore + calScore + proScore ;
        return score;

    };
    this.__proto__ = new GameMode(id,nicename,instructions,this.evaluateGoal);
}

var FITBMode = function(id,nicename,instructions)
{
    this.__proto__ = new GoalMode(id,nicename,instructions,null);
    this.scoreFunc = function()
    {
        var totalCals = currentPlate.getTotals().cals;
        this.max_calories = totalCals;
        return this.evaluateGoal();
    }
}
var GameModes = {
    lib:{},
    add:function(gamemode)
    {
        this.lib[gamemode.id] = gamemode;
    }
};
debugger;
GameModes.add(new GoalMode('GM_H','High Cal Goal',"",1500));
GameModes.add(new GoalMode('GM_M','Med Cal Goal',"",1100));
GameModes.add(new GoalMode('GM_L','Low Cal Goal',"",800));
GameModes.add(new GoalMode('GM_S','Snack',"",200));
GameModes.add(new FITBMode('GM_FITB','Fill In The Blank',""));



//structure to hold some game state info
var gameManager = {

    //show the tooltip window in the proper place, and keep track of the currently hilighted food
    showTooltip: function(foodItem) {

        $('#foodTitle').text(foodItem.name);
        $('#tooltipRoot').dequeue();
        $('#tooltipRoot').stop().delay(500).fadeIn();
        var screenpos = foodItem.getPositionScreenSpace();
        $('#tooltipRoot').css('left', screenpos[0] - $('#tooltipRoot').width() / 2);
        $('#tooltipRoot').css('top', screenpos[1] - $('#tooltipRoot').width() / 2);
        this.currentFood = foodItem;
        $('#foodPreview').attr('src', foodItem.thumbnail);
        $('#foodcals').text(foodItem.cals);
        $('#foodsalt').text(foodItem.salt);
        $('#foodcarbs').text(foodItem.carbs);
        $('#foodfat').text(foodItem.fat);
        $('#foodprotein').text(foodItem.protein);
    },
    //put the hilighted food on the plate
    takeFood: function() {
        currentPlate.addItem(this.currentFood);
    },
    //hide the tooltip
    hideTooltip: function(foodItem) {
        $('#tooltipRoot').dequeue();
        $('#tooltipRoot').stop().delay(500).fadeOut();
    },
    updateCharts: function() {
        var stats = currentPlate.getTotals();
        var bluffGraph = new Bluff.SideStackedBar('piechart', '600x150');
        bluffGraph.theme_keynote();
        bluffGraph.title = 'Your Nutritional Breakdown';
        bluffGraph.data('Protein', stats.protein * 4);
        bluffGraph.data('fat', stats.fat * 4);
        bluffGraph.data('carbs', stats.carbs * 9);
        bluffGraph.sort = false;
        bluffGraph.draw();
        window.graph = bluffGraph;

        bluffGraph.clear();
        bluffGraph.draw();

        var bluffGraph = new Bluff.SideBar('barchart', '600x200');
        bluffGraph.theme_keynote();
        bluffGraph.title = 'Your Calories and Salt';
        bluffGraph.data('Calorie Goal', 1000);
        bluffGraph.data('Calories', stats.cals);
        bluffGraph.data('Salt Goal', 1000);
        bluffGraph.data('Salt', stats.salt);
        bluffGraph.minimum_value = 0;
        bluffGraph.draw();
        
        window.graph = bluffGraph;
        bluffGraph.sort = false;
        bluffGraph.clear();
        bluffGraph.draw();

        $('#barchart').parent().css('display','inline-block');
        $('#piechart').parent().css('display','inline-block');
        $('#piechart').parent().css('vertical-align','top');
        $('#piechart').parent().css('margin-left','.2em');

    },
    //load everything
    initialize: function() {

        $(document.head).append('<script language="javascript" src="./js/js-class.js" type="text/javascript"></script>');
        $(document.head).append('<script type="text/javascript" src="./js/bluff-min.js"></script>');
        $(document.head).append(' <link rel="stylesheet" type="text/css" href="./vwfDataManager.svc/datafile/NutritionGame/styles.css" />');
        $(document.body).load("./vwfDataManager.svc/datafile/NutritionGame/GUI.html");

        this.initializeToolTip();
        this.initializeScreens();
        this.initializeGUI();
        var query = $.parseQuerystring();
        this.gamemode = query['gamemode'];

        //switch for instruction text in loading screen
        if (this.gamemode == 'FITB')
            $('#instructionText').text('FITB Instruction Text');
        if (this.gamemode == 'Snack')
            $('#instructionText').text('Snack Instruction Text');
        if (this.gamemode == 'Goal_H')
            $('#instructionText').text('Goal_H Instruction Text');
        if (this.gamemode == 'Goal_M')
            $('#instructionText').text('Goal_M Instruction Text');
        if (this.gamemode == 'Goal_L')
            $('#instructionText').text('Goal_L Instruction Text');
        window.setTimeout(function() {
            _dView.interpolateTransforms = false;

        }.bind(this), 500);


    },

    //load the HTML for the full screen images
    initializeScreens: function() {
        $(document.body).append('<div id="screenRoot"></div>');
        $("#screenRoot").load("./vwfDataManager.svc/datafile/NutritionGame/screens.html", function() {
            var headtextfile = 'ht_0.txt';
            var query = $.parseQuerystring();
            if (query['headtxt']) headtextfile = query['headtxt'];
            $('#loadinText1').load("./vwfDataManager.svc/datafile/NutritionGame/texts/" + headtextfile);
        });
        $("#screenRoot").show();

        //when the arrow button is available, make it hide the start screen when clicked
        $("#loadinButtonNext").live('click', function() {
            $("#screenRoot").fadeOut();
            _dView.bind('prerender', this.onRender.bind(this));
            _dView.interpolateTransforms = false;
        })
    },
    //load the HTML for the GUI
    initializeGUI: function() {
        $(document.body).append('<div id="gameGuiRoot"></div>');
        $("#gameGuiRoot").load("./vwfDataManager.svc/datafile/NutritionGame/gui.html", function() {

            //once the GUI is loaded, if we need to load a plate we can do so
            var query = $.parseQuerystring();
            var plateJSON = query['plate'];
            if (plateJSON)
                currentPlate.loadPlate(plateJSON);

        });
        $("#gameGuiRoot").show();

        //the complete mission button should score the plate according to the gamemode
        $("#CompleteMission").live('click', function() {
            gameManager.evaluatePlate();
        });


    },
    //load the HTML for the tooltip
    initializeToolTip: function() {
        $(document.body).append('<div id="tooltipRoot"></div>');
        $("#tooltipRoot").load("./vwfDataManager.svc/datafile/NutritionGame/tooltip.html");
        $('#tooltipRoot').hide();
        $('#tooltipRoot').mouseover(function() {
            $('#tooltipRoot').dequeue();
            $('#tooltipRoot').stop().delay(500).fadeIn();
        });
        $('#tooltipRoot').mouseout(function() {
            $('#tooltipRoot').dequeue();
            $('#tooltipRoot').stop().delay(500).fadeOut();
        });
        $('#foodAddButton').live("click", function() {
            gameManager.takeFood();
        });
    },
    //give the game mode and and the plate, did they pass?
    evaluatePlate: function() {
        $('#screenRoot').show();

        if (this.gamemode == 'snack') {
            $('#LoadoutScreenFail').show();
        }
        if (this.gamemode == 'FITB') {
            $('#LoadoutScreenWin').show();
        }


    }
}


window.setTimeout(function() {
    gameManager.initialize();
}, 500)


//link some input from the VWF sim to the logic in the gamemanager
vwf_view.firedEvent = function(id, event, params) {
    if (allFoods.isFood(id)) {
        if (event == 'pointerOver') {
            allFoods.get(id).hilight();
            gameManager.showTooltip(allFoods.get(id));
        }
        if (event == 'pointerOut') {
            allFoods.get(id).dehilight();
            gameManager.hideTooltip();
        }
        if (event == 'pointerClick') {

            //handled only by tooltip
            //var food = allFoods.get(id);
            //currentPlate.addItem(food, 1);
            //food.hide();
        }
    }
    if (id == tray.id) {
        if (event == 'pointerOver') {
            //  tray.hilight();

        }
        if (event == 'pointerOut') {
            //  tray.dehilight();
        }
        if (event == 'pointerClick') {

        }
    }
}