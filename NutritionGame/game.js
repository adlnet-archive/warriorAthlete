function FoodServing(item, servings) {
    this.servings = servings;
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
            local:local
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
    }

}

//a type of food. Can be put on a plate as part of a serving
//This links together the logical data about nutrition, and the VWF simulation environment
function FoodType(id, name, thumb, carbs, fat, cals, salt, protein, local) {
    this.id = id;
    this.name = name;
    this.carbs = carbs;
    this.fat = fat;
    this.cals = cals;
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
allFoods.add(new FoodType('plane2-vwf-7a0f13ec-fca-ecd-3168-3b8be22fcc0e', 'Onions', 'Salad-Onions.png'));
allFoods.add(new FoodType('plane2-vwf-3a7543b9-401e-74b2-9982-76fcd707463', 'Cut Carrots', 'CutCarrots.png'));
allFoods.add(new FoodType('plane2-vwf-4c641bf7-3111-6336-e87f-1b907039ccfa', 'Tomatos', 'Salad-CherryTomatoes.png'));
allFoods.add(new FoodType('asset-vwf-362e3059-ef81-6442-ada3-8eccf0ccc4f3', 'Sliced Cucumber', 'Salad-Cucumber.png'));
allFoods.add(new FoodType('plane2-vwf-d5faef9a-28cc-3e7b-c39-a57f5c067cbd', 'Spinach', 'Salad-Lettuce.png'));
allFoods.add(new FoodType('plane2-vwf-534d2e05-f844-645c-eb39-dc65d58391db', 'Kale', 'Salad-Lettuce.png'));
allFoods.add(new FoodType('plane2-vwf-802a120a-49ae-7daf-6de8-16eaf97124f0', 'Lettuce', 'Salad-Lettuce.png'));
allFoods.add(new FoodType('asset-vwf-43451d26-ff8c-d94e-4aad-c0a7a3721d1f', 'Chocolate Pie', 'ChocolatePie.png'));
allFoods.add(new FoodType('asset-vwf-10c81564-6623-833e-67e6-4cff29f53af1', 'Glazed Doughnuts', 'Doughnut.png'));
allFoods.add(new FoodType('asset-vwf-25d56d7-12c2-caaa-1a5d-e8fec8e621e1', 'Cheesecake', 'Cheesecake.png'));
allFoods.add(new FoodType('asset-vwf-a8e72f29-ee03-724-3d50-50982db81123', 'Cheeseburger', 'Cheeseburger.png'));
allFoods.add(new FoodType('plane2-vwf-6a1a70ce-8b00-ad1c-6aed-ee7d4f45eecb', 'Lasagna', 'Lasagna.png'));
allFoods.add(new FoodType('plane2-vwf-e704d12b-8bc-cfd9-2286-221ffdb283ef', 'Beans', 'BakedBeans.png'));
allFoods.add(new FoodType('asset-vwf-93189cea-a3b1-8160-b606-84a599dab9b5', 'Grilled Chicken', 'GrilledChicken.png'));
allFoods.add(new FoodType('plane2-vwf-254a7107-cf0a-fd0b-36dd-5e1b4be357d8', 'Eggs', 'ScrambledEggs.png'));
allFoods.add(new FoodType('plane2-vwf-14923032-3f93-5123-582f-23907fbefad5', 'Stew', 'YankeePotRoast.png'));
allFoods.add(new FoodType('asset-vwf-fa1eae88-6b19-3d08-b797-abdbfd93b1f0', 'Bratwurst', 'Bratwurst.png'));
allFoods.add(new FoodType('asset-vwf-402f6d1c-2ff-d5fa-b3d4-402e5c9f815', 'Turkey and Gravy', 'SlicedTurkey.png'));
allFoods.add(new FoodType('asset-vwf-30c8a4ed-2b45-fa8e-9e9e-dd8c61f5b692', 'Fried Chicken', 'Fried Chicken.png'));
allFoods.add(new FoodType('asset-vwf-a39b7a43-5a72-4cab-6c14-dac3a0735b9f', 'Baked Potatoes', 'BakedPotato.png'));
allFoods.add(new FoodType('plane2-vwf-e19dd54b-f1e1-b87a-e9b3-a1bddf7c4bc', 'Macaroni', 'Mac-Cheese.png'));
allFoods.add(new FoodType('plane2-vwf-cc3d7fc5-e9cf-c195-9a8c-4fe4860fa88', 'Eggplant Parm'));
allFoods.add(new FoodType('plane2-vwf-d8ee41a-480-9926-490d-54948dbfb377', 'Mashed Potatos', 'MashedPotatoes.png'));
allFoods.add(new FoodType('plane2-vwf-22001381-dc4a-94a7-324c-25acaa51da4d', 'Noodles'));
allFoods.add(new FoodType('plane2-vwf-aa52b080-c338-dde8-693b-77d2666abe1', 'Brown Rice', 'WildRice.png'));
allFoods.add(new FoodType('plane2-vwf-d1387ed7-c89c-e3aa-ddea-da14a16ee580', 'White Rice', 'Steamed_Rice.png'));
allFoods.add(new FoodType('asset-vwf-ad70b7e8-d5fc-81cc-fa94-3c1ab974cf6f', 'Broccoli', 'Broccoli.png'));
allFoods.add(new FoodType('asset-vwf-63f22a47-86ac-2a61-1f40-82bb5f988ac9', 'Carrots', 'Salad-Carrots.png'));
allFoods.add(new FoodType('asset-vwf-ccfffe81-c102-6db1-36e1-9c5b3148f5e9', 'Corn on Cob', 'CornCob.png'));
allFoods.add(new FoodType('asset-vwf-7b6f8613-7c4f-adc5-b0d5-5efbb74b4fe', 'Green Beans', 'GreenBeans.png'));
allFoods.add(new FoodType('asset-vwf-f9a2374c-221c-4e17-d321-c06f7f0c863b', 'Bananas', 'Banana.png'));
allFoods.add(new FoodType('asset-vwf-927ec08b-956c-6e56-adfe-653ca0d46e49', 'Green Apples', 'GreenApple.png'));
allFoods.add(new FoodType('asset-vwf-78463c0-3d2d-3f58-2d61-9aac3201809d', 'Cornbread', 'Cornbread.png'));
allFoods.add(new FoodType('asset-vwf-be12dd76-4923-ffd8-f147-8220b9e75a2e', 'Breads', 'Criossant.png'));
allFoods.add(new FoodType('asset-vwf-f52d3dd3-2bcf-8981-f571-6cde48886998', 'Bread Roll', 'BreadRoll.png'));

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
        if(this.gamemode == 'FITB')
            $('#instructionText').text('FITB Instruction Text');
        if (this.gamemode == 'Snack')
            $('#instructionText').text('Snack Instruction Text');
        if (this.gamemode == 'Goal_H')
            $('#instructionText').text('Goal_H Instruction Text');
        if (this.gamemode == 'Goal_M')
            $('#instructionText').text('Goal_M Instruction Text');
        if (this.gamemode == 'Goal_L')
            $('#instructionText').text('Goal_L Instruction Text');
         _dView.bind('prerender', this.onRender.bind(this));

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
        })
    },
    //load the HTML for the GUI
    initializeGUI: function() {
        $(document.body).append('<div id="gameGuiRoot"></div>');
        $("#gameGuiRoot").load("./vwfDataManager.svc/datafile/NutritionGame/gui.html",function(){

            //once the GUI is loaded, if we need to load a plate we can do so
            var query = $.parseQuerystring();
            var plateJSON = query['plate'];
            if(plateJSON)
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

/*
 var bluffGraph = new Bluff.Pie('plateCanvas', 400);
                                        bluffGraph.theme_keynote();
                                        bluffGraph.title = 'Your Nutritional Breakdown';
                                        bluffGraph.data('Protein', protein);
                                        bluffGraph.data('fat', fat);
                                        bluffGraph.data('carbs', carbs);
                                        bluffGraph.draw();
                                        window.graph = bluffGraph;
                                        
                                        bluffGraph.clear();
                                        bluffGraph.draw();
*/
window.setTimeout(function()
{
gameManager.initialize();    
},500)


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