(function ($) {
	AjaxSolr.AutocompleteTextAreaWidget = AjaxSolr.AbstractTextWidget.extend({
		mode:"",
		hasLevels:false,
		init: function () {
			var self = this;

			self.queries=self.manager.widgets["requester"].queries;
			$("#"+this.target+ " textarea").remove();
			$("#"+this.target+ " button").remove();
			$("#"+this.target+ " br").remove();
			$("#"+this.target+ " #modes").remove();
			$("#"+this.target).append('<textarea id="query" name="query" placeholder="Accession numbers separated by comma. e.g. P09239, Q05861"></textarea><br/>');
			
			$("#"+this.target).append('<button type="button">Search</button>');

			$("#"+this.target).append('<div id="modes" />');
			if (typeof self.modes!="undefined"){
				var modes=$("#"+this.target).find("#modes");
				modes.html("<ul class='drop_menu_container'><li>" +
						"<a class='drop'>Mode: <span class='mode_label'>Normal</span></a>" +
						"<div class='dropdown_"+self.modes.length+"columns'></li></ul>");
				var optionsdiv=modes.find('.dropdown_'+self.modes.length+'columns');
				optionsdiv.html('<div class="col_3"><h2>Choose the mode to query</h2></div>');
				for (var i = 0; i < self.modes.length; i++) {
					var selected =(typeof self.modes[i].selected != "undefined" && self.modes[i].selected==true)?" selected":"";
					if (selected!="") modes.find('span').html(self.modes[i].label);
					optionsdiv.append(	"<div class='col_1 option"+selected+"'>" +
											"<h3>"+self.modes[i].label+"</h3>" +
											"<img src='"+self.modes[i].img+"' width='95' alt='"+self.modes.label+"' />" +
											"<p>"+self.modes[i].description+"</p>" +
										"</div>");
				}
				self.mode = $("#"+this.target).find(".selected h3").html().toLowerCase();
				modes.find('.option').click(function(){
					modes.find('.selected').removeClass("selected");
					$(this).addClass("selected");
					modes.find('span').html($(this).find("h3").html());
					self.mode = $(this).find("h3").html().toLowerCase();
					if ( typeof Manager.widgets["provenance"] != "undefined") {
						Manager.widgets["provenance"].addAction("Search mode changed",self.id,self.mode);
					}
				});
			}

			var area= $("#"+this.target).find('textarea');

			$("#"+this.target).find('textarea').unbind().removeData('events').val('');
			

			var gotOptions = function (response) {
				var list = [];
				var facets=[];
				for (var i = 0; i < self.fields.length; i++) {
					var field = self.fields[i];
					for (var facet in response.facet_counts.facet_fields[field]) {
						if (facets.indexOf(facet)==-1){
							list.push({
								field: field,
								value: facet,
								text: facet + ' (' + response.facet_counts.facet_fields[field][facet] + ') - ' + field
							});
							facets.push(facet);
						}
					}
				}
				//TODO: Change because this widget should be agnostic of other widgets (i.e. queryfilter)
				self.manager.widgets["queryfilter"].setTotalProteins(list.length);

				self.requestSent = false;
				$("#"+self.target).find('textarea').unautocomplete().autocomplete(list, {
					formatItem: function(facet) {
						return facet[self.facet];
					},
					multiple: true
				});
				
			}; // end callback

			$("#"+this.target).find('button').click(function(e){
				if ( typeof Manager.widgets["provenance"] != "undefined") {
					Manager.widgets["provenance"].addAction("New search submitted",self.id,area.val());
				}
				var values=area.val().split(/[,\s]+/);
				var valuesClean=[];
				for (var i=0; i<values.length; i++){
					var value=$.trim(values[i]).replace(/"/g,"red");
					if (value!="")
						valuesClean.push(value);
				}
					self.requestSent = true;
					self.manager.widgets["requester"].request(valuesClean ,self.mode);
				$("#"+self.target).find('textarea').val('');
			});


			var paramsL = [ 'q=*&rows=0&facet=true&facet.limit=-1&facet.mincount=1&json.nl=map' ];
			if (typeof self.fields == "undefined")
				self.fields = params['facet.field'];
			for (var i = 0; i < self.fields.length; i++) 
				paramsL.push('facet.field=' + self.fields[i]);
			if ( typeof private_key != "undefined" && private_key != null && private_key != "null")
				paramsL.push("key="+private_key);
			
			paramsL.push('q=' + this.manager.store.get('q').val());
			
			if (modelrequester!=null) modelrequester.done(function(p){
				for (var i=0;i<model.length;i++){
					if (typeof model[i].id != "undefined" && model[i].id=="level")
						self.hasLevels = true;
				}
				var level = (self.hasLevels)?"&fq=level:0":"";
					
				jQuery.getJSON(self.manager.solrUrl + 'select?' + paramsL.join('&') + '&wt=json&json.wrf=?'+level, {}, gotOptions);
			});

			
		},
		initTest: function(){
			var self = this;
			ok($("#"+self.target+" textarea").length>0,"Widget("+self.id+"-AutocompleteTextAreaWidget): The target contains at least a TEXTAREA element");
			ok($("#"+self.target+" button").length>0,"Widget("+self.id+"-AutocompleteTextAreaWidget): The target contains at least a Button element");
			ok($("#"+self.target+" .drop_menu_container").length>0,"Widget("+self.id+"-AutocompleteTextAreaWidget): The target contains at least an element with class drop_menu_container");
			
			var modesLI=$("#"+self.target+ " .option");
			equal(modesLI.length,self.modes.length,"Widget("+self.id+"-AutocompleteTextAreaWidget): the number of modes is according to the json");
			var modeSelected=null,modeUnselected=null;
			for (var j=0;j<modesLI.length;j++){
				if ($(modesLI[j]).hasClass( "selected" ))
					modeSelected = $(modesLI[j]);
				else
					modeUnselected = $(modesLI[j]);
				equal($(modesLI[j]).hasClass( "selected" ),typeof self.modes[j].selected != "undefined" && self.modes[j].selected,"Widget("+self.id+"-AutocompleteTextAreaWidget): The tab "+self.modes[j].label+" has been well initialized");
			}
			ok(modeSelected!=null,"Widget("+self.id+"-AutocompleteTextAreaWidget): There is at least one mode selected");
			ok(modeUnselected!=null,"Widget("+self.id+"-AutocompleteTextAreaWidget): There is at least one mode no selected");
			modeUnselected.click();
			equal(modeUnselected.hasClass( "selected" ),true,"Widget("+self.id+"-AutocompleteTextAreaWidget): the unselected tab has change its class once has been click");
			equal(modeSelected.hasClass( "selected" ),false,"Widget("+self.id+"-AutocompleteTextAreaWidget): the selected tab has change its class once has been click");
			equal(self.mode,modeUnselected.find("h3").html().toLowerCase(),"Widget("+self.id+"-AutocompleteTextAreaWidget): The the mode has changed after clicking.");
			
		},
		status2JSON:function(){
			var self = this;
			return {"mode":$("#"+self.target+ " .selected h3").text()};
		},
		uploadStatus:function(json){
			$("#"+self.target+ " .option h3:contains(\""+json.mode+"\")").parent().click();
		}
	});

})(jQuery);
