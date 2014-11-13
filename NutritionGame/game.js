function FoodServing(item, servings) {
    this.servings = servings;
    this.food = item;
}

var currentPlate = {
    items: [],
    getTotals : function() {
        var cals = 0;
        var fat = 0;
        var salt = 0;
        var protein = 0;
        var carbs = 0;
        for (var i = 0; i < this.items.length; i++) {
            var servings = this.items[i].servings;
            cals += this.items[i].food.cals * servings;
            salt += this.items[i].food.salt * servings;
            fat += this.items[i].food.fat * servings;
            protein += this.items[i].food.protein * servings;
            carbs += this.items[i].food.carbs * servings;
        }
        return {
            carbs: carbs,
            cals: cals,
            fat: fat,
            salt: salt,
            protein: protein
        };
    },
    removeItem : function(id) {
        var index = this.findItem(id);
        if (index)
            this.items.splice(index, 1);
    },
    addItem : function(foodItem, servings) {
        this.items.push(new FoodServing(foodItem, servings));
    }
}

function FoodType(id, name, carbs, fat, cals, salt, protein) {
    this.id = id;
    this.name = name;
    this.carbs = carbs;
    this.fat = fat;
    this.cals = cals;
    this.salt = salt;
    this.protein = protein;
    this.getPosition = function()
    {
    	return vwf.getProperty(this.id,'worldPosition');
    }
    this.getPositionScreenSpace =function()
    {
      var position = this.getPosition();

      var pos = position;
      pos = [pos[0],pos[1],pos[2],1];
      
      var _viewProjectionMatrix = new THREE.Matrix4();
      _viewProjectionMatrix.multiplyMatrices(_dView.getCamera().projectionMatrix, _dView.getCamera().matrixWorldInverse);
      vp = _viewProjectionMatrix.transpose().toArray([]);   
      
      var screen = MATH.mulMat4Vec4(vp,pos);
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

var tray = new FoodType("asset-vwf-420c9d0b-b6e2-e4d7-6484-d7666b20289f",'Tray');

var allFoods = {

	lib : {},
	add : function(foodType)
	{
		this.lib[foodType.id] = foodType;
	},
	get : function(id)
	{
		return this.lib[id];
	},
	isFood :function(id)
	{
		if(this.lib[id])
			return true;
		return false;
	}
}
allFoods.add(new FoodType('plane2-vwf-7a0f13ec-fca-ecd-3168-3b8be22fcc0e','DFAC Onions'));
allFoods.add(new FoodType('plane2-vwf-3a7543b9-401e-74b2-9982-76fcd707463','DFAC Cut Carrots'));
allFoods.add(new FoodType('plane2-vwf-4c641bf7-3111-6336-e87f-1b907039ccfa','DFAC Tomatos'));
allFoods.add(new FoodType('asset-vwf-362e3059-ef81-6442-ada3-8eccf0ccc4f3','DFAC Sliced Cucumber Lowpoly1'));
allFoods.add(new FoodType('plane2-vwf-d5faef9a-28cc-3e7b-c39-a57f5c067cbd','DFAC Spinach'));
allFoods.add(new FoodType('plane2-vwf-534d2e05-f844-645c-eb39-dc65d58391db','DFAC Kale'));
allFoods.add(new FoodType('plane2-vwf-802a120a-49ae-7daf-6de8-16eaf97124f0','DFAC Lettuce'));
allFoods.add(new FoodType('asset-vwf-43451d26-ff8c-d94e-4aad-c0a7a3721d1f','Chocolate Pie Lowpoly1'));
allFoods.add(new FoodType('asset-vwf-10c81564-6623-833e-67e6-4cff29f53af1','Glazed Doughnuts Lowpoly1'));
allFoods.add(new FoodType('asset-vwf-25d56d7-12c2-caaa-1a5d-e8fec8e621e1','Cheesecake Lowpoly2'));
allFoods.add(new FoodType('asset-vwf-a8e72f29-ee03-724-3d50-50982db81123','Cheeseburger Lowpoly2'));
allFoods.add(new FoodType('plane2-vwf-6a1a70ce-8b00-ad1c-6aed-ee7d4f45eecb','Lasagna'));
allFoods.add(new FoodType('plane2-vwf-e704d12b-8bc-cfd9-2286-221ffdb283ef','Beans'));
allFoods.add(new FoodType('asset-vwf-93189cea-a3b1-8160-b606-84a599dab9b5','Grilled Chicken Lowpoly2'));
allFoods.add(new FoodType('plane2-vwf-254a7107-cf0a-fd0b-36dd-5e1b4be357d8','Eggs'));
allFoods.add(new FoodType('plane2-vwf-14923032-3f93-5123-582f-23907fbefad5','Stew'));
allFoods.add(new FoodType('asset-vwf-fa1eae88-6b19-3d08-b797-abdbfd93b1f0','Bratwurst Lowpoly2'));
allFoods.add(new FoodType('asset-vwf-402f6d1c-2ff-d5fa-b3d4-402e5c9f815','Turkey and Gravy Lowpoly1'));
allFoods.add(new FoodType('asset-vwf-30c8a4ed-2b45-fa8e-9e9e-dd8c61f5b692','Fried Chicken Lowpoly2'));
allFoods.add(new FoodType('asset-vwf-a39b7a43-5a72-4cab-6c14-dac3a0735b9f','Baked Potatoes Lowpoly2'));
allFoods.add(new FoodType('plane2-vwf-e19dd54b-f1e1-b87a-e9b3-a1bddf7c4bc','Macaroni'));
allFoods.add(new FoodType('plane2-vwf-cc3d7fc5-e9cf-c195-9a8c-4fe4860fa88','Eggplant Parm'));
allFoods.add(new FoodType('plane2-vwf-d8ee41a-480-9926-490d-54948dbfb377','Mashed Potatos'));
allFoods.add(new FoodType('plane2-vwf-22001381-dc4a-94a7-324c-25acaa51da4d','Noodles'));
allFoods.add(new FoodType('plane2-vwf-aa52b080-c338-dde8-693b-77d2666abe1','Brown Rice'));
allFoods.add(new FoodType('plane2-vwf-d1387ed7-c89c-e3aa-ddea-da14a16ee580','White Rice'));
allFoods.add(new FoodType('asset-vwf-ad70b7e8-d5fc-81cc-fa94-3c1ab974cf6f','Broccoli Lowpoly2'));
allFoods.add(new FoodType('asset-vwf-63f22a47-86ac-2a61-1f40-82bb5f988ac9','Carrots Lowpoly2'));
allFoods.add(new FoodType('asset-vwf-ccfffe81-c102-6db1-36e1-9c5b3148f5e9','Corn on Cob Lowpoly1'));
allFoods.add(new FoodType('asset-vwf-7b6f8613-7c4f-adc5-b0d5-5efbb74b4fe','Green Beans Lowpoly2'));
allFoods.add(new FoodType('asset-vwf-f9a2374c-221c-4e17-d321-c06f7f0c863b','Bananas Lowpoly2'));
allFoods.add(new FoodType('asset-vwf-927ec08b-956c-6e56-adfe-653ca0d46e49','Green Apples Lowpoly1'));
allFoods.add(new FoodType('asset-vwf-78463c0-3d2d-3f58-2d61-9aac3201809d','Cornbread Lowpoly2'));
allFoods.add(new FoodType('asset-vwf-be12dd76-4923-ffd8-f147-8220b9e75a2e','Breads Lowpoly2'));
allFoods.add(new FoodType('asset-vwf-f52d3dd3-2bcf-8981-f571-6cde48886998','Bread Roll Lowpoly1'));

var gameManager = 
{
	showTooltip:function(foodItem)
	{
		$('#tooltipRoot').dequeue();
		$('#tooltipRoot').stop().delay(1500).fadeIn();
		var screenpos = foodItem.getPositionScreenSpace();
		$('#tooltipRoot').css('left', screenpos[0] - $('#tooltipRoot').width()/2);
		$('#tooltipRoot').css('top', screenpos[1]  - $('#tooltipRoot').width()/2);
	},
	hideTooltip:function(foodItem)
	{
		$('#tooltipRoot').dequeue();
		$('#tooltipRoot').stop().delay(1500).fadeOut();
	},
	initialize:function()
	{
		_dView.bind('prerender',this.onRender.bind(this));
		$(document.head).append(' <link rel="stylesheet" type="text/css" href="./vwfDataManager.svc/datafile/NutritionGame/styles.css" />');
		$(document.body).load("./vwfDataManager.svc/datafile/NutritionGame/GUI.html");
		this.initializePlate();
		this.initializeToolTip();
	},
	showPlate:function()
	{
		$('#MyPlate').show();
	},
	initializePlate:function()
	{
		$(document.body).append('<div id="plateRoot"></div>');
		$("#plateRoot").load("./vwfDataManager.svc/datafile/NutritionGame/plate.html");
	},
	initializeToolTip:function()
	{
		$(document.body).append('<div id="tooltipRoot"></div>');
		$("#tooltipRoot").load("./vwfDataManager.svc/datafile/NutritionGame/tooltip.html");
		$('#tooltipRoot').hide();
		$('#tooltipRoot').mouseover(function()
		{
			$('#tooltipRoot').dequeue();
			$('#tooltipRoot').stop().delay(1500).fadeIn();
		});
		$('#tooltipRoot').mouseout(function()
		{
			$('#tooltipRoot').dequeue();
			$('#tooltipRoot').stop().delay(1500).fadeOut();
		});
	},
	startIntro:function()
	{

	},
	onRender:function()
	{


	}
}

gameManager.initialize();

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
        	
        	var food = allFoods.get(id);
        	currentPlate.addItem(food,1);
        	//food.hide();
        }
    }
    if(id == tray.id)
    {
		if (event == 'pointerOver') {
           tray.hilight();
           
        }
        if (event == 'pointerOut') {
           tray.dehilight();
        }
        if (event == 'pointerClick') {
        	gameManager.showPlate();
        }
    }
}