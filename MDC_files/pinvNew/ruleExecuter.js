(function ($) {
  $(function () {
	  	$.fn.ruler={};
		$.fn.ruler.applyRules = function(self){
			//not apply rules on a non visible target
			if (	!$("#"+self.target).is(':visible') ||
					!Manager.widgets["ruler"].ruler) 
				return;
			
			var rules = Manager.widgets["ruler"].ruler.getActiveRules();
			var model = Manager.widgets["ruler"].rules;

			var selector ="";
			if (Object.keys(self.graph.interactionsA).length>0) //making sure there is anything in the graph to apply a rule
			 for (var i=0;i<rules.length;i++){
				selector ="";
				var rule=rules[i];
				if (rule.target==model.target[0].name){ //Proteins
					var prefix =(rule.action.name=="Resize" || rule.action.name=="Resize By" || rule.action.name=="Color" || rule.action.name=="Color By" || rule.action.name=="Border" || rule.action.name=="Border By" || rule.action.name=="Highlight")?"figure_":"node_";
					var prefix2=(rule.action.name=="Resize" || rule.action.name=="Resize By" || rule.action.name=="Color" || rule.action.name=="Color By" || rule.action.name=="Border" || rule.action.name=="Border By" || rule.action.name=="Highlight")?".figure":".node";
					switch (rule.condition){
						case model.target[0].conditions[1].name: // interactions with
							if (typeof self.graph.interactionsA[rule.parameters[0]] == "undefined") 
								selector="";
							else{
								for (var j=0;j<self.graph.interactionsA[rule.parameters[0]].length;j++){
									selector +="[id ="+prefix+self.graph.interactionsA[rule.parameters[0]][j].name+"],";
								}
								selector = selector.substring(0, selector.length-1);
							}
							break;
						case model.target[0].conditions[2].name: // number of interactions
							for (var interaction in self.graph.interactionsA){
								switch (rule.parameters[0]){
									case "==":
										if (self.graph.interactionsA[interaction].length==1*rule.parameters[1])
											selector +="[id="+prefix+interaction+"],";
										break;
									case ">":
										if (self.graph.interactionsA[interaction].length>1*rule.parameters[1])
											selector +="[id="+prefix+interaction+"],";
										break;
									case "<":
										if (self.graph.interactionsA[interaction].length<1*rule.parameters[1])
											selector +="[id="+prefix+interaction+"],";
										break;
									case "<=":
										if (self.graph.interactionsA[interaction].length<=1*rule.parameters[1])
											selector +="[id="+prefix+interaction+"],";
										break;
									case ">=":
										if (self.graph.interactionsA[interaction].length>=1*rule.parameters[1])
											selector +="[id="+prefix+interaction+"],";
										break;
								}
							}
							if (selector.length>0) selector = selector.substring(0, selector.length-1);
							break;
						case model.target[0].conditions[3].name: // accession number
							switch (rule.parameters[0]){
								case "equals":
									selector ="#"+prefix+rule.parameters[1];
									break;
								case "contains":
									selector =prefix2+"[id *=\""+rule.parameters[1]+"\"]";
									break;
								case "different":
									selector =prefix2+':not([id="'+prefix+rule.parameters[1]+'"])';
									break;
								case "not contains":
									selector =prefix2+":not([id *="+rule.parameters[1]+"])";
									break;
								case "in list":
									var list = rule.parameters[1].split(",");
									for (var j in list)
										selector += "#"+prefix+(list[j].trim())+",";
									if (selector.length>0) selector = selector.substring(0, selector.length-1);
									break;
							}
							break;
						case model.target[0].conditions[4].name: // features
							var nodes= self.graph.force.nodes();
							for (var j in nodes){
								var node = nodes[j];
								var value= node.features[rule.parameters[0]];
								switch (rule.parameters[1]){
									case "equals":
										if  (value == rule.parameters[2] )
											selector +="[id="+prefix+node.id+"],";
										break;
									case "contains":
										if (value.indexOf(rule.parameters[2])!=-1)
											selector +="[id="+prefix+node.id+"],";
										break;
									case "different":
										if (value!=rule.parameters[2]){
											selector +="[id="+prefix+node.id+"],";
										}
										break;
									case "not contains":
										if (value.indexOf(rule.parameters[2])==-1)
											selector +="[id="+prefix+node.id+"],";
										break;
									case "in list":
										var list = rule.parameters[2].split(",");
										for (var j in list)
											if  (value == list[j].trim() )
												selector +="[id="+prefix+node.id+"],";
										break;
								}
							}
							if (selector.length>0) selector = selector.substring(0, selector.length-1);
							break;
						case model.target[0].conditions[0].name: // all
							selector = prefix2;
							break;
					}
				} else if (rule.target==model.target[1].name) { //Interactions
					switch (rule.condition){
						case model.target[1].conditions[1].name: // protein
							selector ="line[id *="+rule.parameters[0]+"]";
							break;
						case model.target[1].conditions[2].name: // proteins
							selector ="line[id *="+rule.parameters[0]+"][id *="+rule.parameters[1]+"]";
							break;
						case model.target[1].conditions[3].name: // score
							var links= self.graph.force.links();
							for (var j in links){
								var link = links[j];
								var score=link["score"];
								switch (rule.parameters[0]){
									case "==":
										if (1*score==1*rule.parameters[1])
											selector +="[id=link_"+link.source.name+"_"+link.target.name+"],";
										break;
									case ">":
										if (1*score>1*rule.parameters[1])
											selector +="[id=link_"+link.source.name+"_"+link.target.name+"],";
										break;
									case "<":
										if (1*score<1*rule.parameters[1])
											selector +="[id=link_"+link.source.name+"_"+link.target.name+"],";
										break;
									case "<=":
										if (1*score<=1*rule.parameters[1])
											selector +="[id=link_"+link.source.name+"_"+link.target.name+"],";
										break;
									case ">=":
										if (1*score>=1*rule.parameters[1])
											selector +="[id=link_"+link.source.name+"_"+link.target.name+"],";
										break;
								}
							}
							if (selector.length>0) selector = selector.substring(0, selector.length-1);
							break;
						case model.target[1].conditions[4].name: // type of evidence
							var links= self.graph.force.links();
							for (var j in links){
								var link = links[j];
								var score=link.doc[rule.parameters[0]];
								if (typeof score != "undefined" && score*1>0.0){
									selector +="[id=link_"+link.source.name+"_"+link.target.name+"],";
								}
							}
							if (selector.length>0) selector = selector.substring(0, selector.length-1);
							break;
						case model.target[1].conditions[0].name: // all
							selector =".link";
							break;
					}					
				}
				if (selector!="") switch (rule.action.name){
					case "Hide":
						self.graph.hide(selector);
						break;
					case "Show":
						self.graph.show(selector);
						break;
					case "Highlight":
						self.graph.highlight(selector);
						break;
					case "Border":
						self.graph.setColor(selector,rule.actionParameters[0]); 
						self.graph.addLegends([rule.condition+" "+rule.parameters.join(" ")],"Border ("+rule.target+")",rule.actionParameters[0]);
						break;
					case "Color":
						self.graph.setFillColor(selector,rule.actionParameters[0]);
						self.graph.addLegends([rule.condition+" "+rule.parameters.join(" ")],"Color",rule.actionParameters[0]);
						break;
					case "Color By":
					case "Border By":
						var type = (rule.action.name=="Color By")?"color":"border";
						if (rule.target==model.target[0].name){
							if (rule.actionParameters[0]=="Protein Queried")
								self.colorBySeed(self,selector,type);
							else
								self.colorByFeature(self,rule.actionParameters[0],selector,type);
						}
						break;
					case "Show Label":
						self.graph.showLegend(selector,rule.actionParameters[0]);
						break;
					case "Hide Label":
						self.graph.hideLegend(selector);
						break;
					case "Resize":
						self.graph.setSizeScale(selector,rule.actionParameters[0]);
						break;
					case "Resize By":
						try{
							self.resizeByFeature(self,rule.actionParameters[0],selector);
						}catch(err){
							selector="-1";
							self.manager.widgets["ruler"].ruler.warningMessage(rule.id,"At least one of the values of the selected feature is not numeric");
							self.manager.widgets["ruler"].ruler.setAffectedByRule(rule.id,affected);

						}
						break;
					case "Font Size":
						self.graph.setLabelFontSize(selector,rule.actionParameters[0]);
						break;
					case "Opacity":
						self.graph.setOpacity(selector,rule.actionParameters[0]);
						break;
					case "Opacity By":
						try{
							self.opacityByFeature(self,rule.actionParameters[0],selector,rule.target==model.target[0].name);
						}catch(err){
							selector="-1";
							self.manager.widgets["ruler"].ruler.warningMessage(rule.id,"At least one of the values of the selected feature is not numeric");
						}
						break;
				}
				var affected = 0;
				if (selector!="" && selector!="-1")
					affected=self.graph.vis.selectAll(selector)[0].length;
				self.manager.widgets["ruler"].ruler.setAffectedByRule(rule.id,affected);
				if (selector!="-1" && affected==0)
					self.manager.widgets["ruler"].ruler.warningMessage(rule.id,"The filter is too restrictive. There were not proteins affected by it.");
			}
		};	  	
		$.fn.ruler.applyRules2 = function(self){
			//not apply rules on a non visible target
			if (!$("#"+self.target).is(':visible') ||
					!Manager.widgets["ruler"].ruler) 
				return;

			var rules = Manager.widgets["ruler"].ruler.getActiveRules();
			var model = Manager.widgets["ruler"].rules;

			var selector ="";
			if (Object.keys(self.graph.interactionsA).length>0) //making sure there is anything in the graph to apply a rule
			 for (var i=0;i<rules.length;i++){
				selector ="";
				var rule=rules[i];
				if (rule.target==model.target[0].name){ //Proteins
					var prefix=(rule.action.name=="Resize" || rule.action.name=="Resize By" || rule.action.name=="Color" || rule.action.name=="Color By" || rule.action.name=="Highlight")?"figure_":"node-";
					var prefix2=(rule.action.name=="Resize" || rule.action.name=="Resize By" || rule.action.name=="Color" || rule.action.name=="Color By" || rule.action.name=="Highlight")?".figure":".node";
					switch (rule.condition){
						case model.target[0].conditions[1].name: // interactions with
							if (typeof self.graph.interactionsA[rule.parameters[0]] == "undefined") 
								selector="";
							else{
								for (var j=0;j<self.graph.interactionsA[rule.parameters[0]].length;j++){
									selector +="[id ="+prefix+self.graph.interactionsA[rule.parameters[0]][j].name+"],";
								}
								selector = selector.substring(0, selector.length-1);
							}
							break;
						case model.target[0].conditions[2].name: // number of interactions
							for (var interaction in self.graph.interactionsA){
								switch (rule.parameters[0]){
									case "==":
										if (self.graph.interactionsA[interaction].length==1*rule.parameters[1])
											selector +="[id="+prefix+interaction+"],";
										break;
									case ">":
										if (self.graph.interactionsA[interaction].length>1*rule.parameters[1])
											selector +="[id="+prefix+interaction+"],";
										break;
									case "<":
										if (self.graph.interactionsA[interaction].length<1*rule.parameters[1])
											selector +="[id="+prefix+interaction+"],";
										break;
									case "<=":
										if (self.graph.interactionsA[interaction].length<=1*rule.parameters[1])
											selector +="[id="+prefix+interaction+"],";
										break;
									case ">=":
										if (self.graph.interactionsA[interaction].length>=1*rule.parameters[1])
											selector +="[id="+prefix+interaction+"],";
										break;
								}
							}
							if (selector.length>0) selector = selector.substring(0, selector.length-1);
							break;
						case model.target[0].conditions[3].name: // accession number
							switch (rule.parameters[0]){
								case "equals":
									selector ="#"+prefix+rule.parameters[1];
									break;
								case "contains":
									selector =prefix2+"[id *=\""+rule.parameters[1]+"\"]";
									break;
								case "different":
									selector =prefix2+':not([id="node_'+rule.parameters[1]+'"])';
									break;
								case "not contains":
									selector =prefix2+":not([id *="+rule.parameters[1]+"])";
									break;
								case "in list":
									var list = rule.parameters[1].split(",");
									for (var j in list)
										selector += "#"+prefix+(list[j].trim())+",";
									if (selector.length>0) selector = selector.substring(0, selector.length-1);
									break;
							}
							break;
						case model.target[0].conditions[4].name: // features
							var nodes= self.graph.proteins;
							for (var j in nodes){
								var node = nodes[j];
								var value= node.features[rule.parameters[0]];
								switch (rule.parameters[1]){
									case "equals":
										if  (value == rule.parameters[2] )
											selector +="[id="+prefix+node.id+"],";
										break;
									case "contains":
										if (value.indexOf(rule.parameters[2])!=-1)
											selector +="[id="+prefix+node.id+"],";
										break;
									case "different":
										if (value!=rule.parameters[2]){
											selector +="[id="+prefix+node.id+"],";
										}
										break;
									case "not contains":
										if (value.indexOf(rule.parameters[2])==-1)
											selector +="[id="+prefix+node.id+"],";
										break;
									case "in list":
										var list = rule.parameters[2].split(",");
										for (var j in list)
											if  (value == list[j].trim() )
												selector +="[id="+prefix+node.id+"],";
										break;
								}
							}
							if (selector.length>0) selector = selector.substring(0, selector.length-1);
							break;
						case model.target[0].conditions[0].name: // all
							selector = prefix2;
							break;
					}
				} else if (rule.target==model.target[1].name) { //Interactions
					switch (rule.condition){
						case model.target[1].conditions[1].name: // protein
							selector =".link[id *="+rule.parameters[0]+"]";
							break;
						case model.target[1].conditions[2].name: // proteins
							selector =".link[id *="+rule.parameters[0]+"][id *="+rule.parameters[1]+"]";
							break;
						case model.target[1].conditions[3].name: // score
							var links= self.graph.interactions;
							for (var j in links){
								var link = links[j];
								var score=link["score"];

								switch (rule.parameters[0]){
									case "==":
										if (1*score==1*rule.parameters[1])
											selector +="[id=link-"+link.source.name+"-"+link.target.name+"],";
										break;
									case ">":
										if (1*score>1*rule.parameters[1])
											selector +="[id=link-"+link.source.name+"-"+link.target.name+"],";
										break;
									case "<":
										if (1*score<1*rule.parameters[1])
											selector +="[id=link-"+link.source.name+"-"+link.target.name+"],";
										break;
									case "<=":
										if (1*score<=1*rule.parameters[1])
											selector +="[id=link-"+link.source.name+"-"+link.target.name+"],";
										break;
									case ">=":
										if (1*score>=1*rule.parameters[1])
											selector +="[id=link-"+link.source.name+"-"+link.target.name+"],";
										break;
								}
							}
							if (selector.length>0) selector = selector.substring(0, selector.length-1);
							break;
						case model.target[1].conditions[4].name: // type of evidence
							var links= self.graph.interactions;
							for (var j in links){
								var link = links[j];
								var score=link.doc[rule.parameters[0]];
								if (typeof score != "undefined" && score*1>0.0){
									selector +="[id=link-"+link.source.name+"-"+link.target.name+"],";
								}
							}
							if (selector.length>0) selector = selector.substring(0, selector.length-1);
							break;
						case model.target[1].conditions[0].name: // all
							selector =".link";
							break;
					}					
				}
				if (selector!="") switch (rule.action.name){
					case "Hide":
						self.graph.hide(selector);
						break;
					case "Show":
						self.graph.show(selector);
						break;
					case "Highlight":
						self.graph.highlight(selector);
						break;
					case "Border":
						self.graph.setColor(selector,rule.actionParameters[0]);
						self.graph.addLegends([rule.condition+" "+rule.parameters.join(" ")],"Border ("+rule.target+")",rule.actionParameters[0]);
						break;
					case "Color":
						self.graph.setFillColor(selector,rule.actionParameters[0]);
						self.graph.addLegends([rule.condition+" "+rule.parameters.join(" ")],"Color",rule.actionParameters[0]);
						break;
					case "Color By":
					case "Border By":
						var type = (rule.action.name=="Color By")?"color":"border";
						if (rule.actionParameters[0]=="Protein Queried")
							self.colorBySeed(self,selector,type);
						else
							self.colorByFeature(self,rule.actionParameters[0],selector,type);
						break;
					case "Show Label":
						self.graph.showLegend(selector,rule.actionParameters[0]);
						break;
					case "Hide Label":
						self.graph.hideLegend(selector);
						break;
					case "Resize":
						self.graph.setSizeScale(selector,rule.actionParameters[0]);
						break;
					case "Resize By":
						try{
							self.resizeByFeature(self,rule.actionParameters[0],selector);
						}catch(err){
							self.manager.widgets["ruler"].ruler.warningMessage(rule.id,"At least one of the values of the selected feature is not numeric");
						}
						break;				
					case "Font Size":
						self.graph.setLabelFontSize(selector,rule.actionParameters[0]);
						break;
					case "Opacity":
						self.graph.setOpacity(selector,rule.actionParameters[0]);
						break;
					case "Opacity By":
						try{
							self.opacityByFeature(self,rule.actionParameters[0],selector,rule.target==model.target[0].name);
						}catch(err){
							selector="-1";
							self.manager.widgets["ruler"].ruler.warningMessage(rule.id,"At least one of the values of the selected feature is not numeric");
						}
						break;
				}
			}
		};
		$.fn.ruler.applyRules3 = function(self){
			//not apply rules on a non visible target
			if (!$("#"+self.target).is(':visible') ||
					!Manager.widgets["ruler"].ruler) 
				return;

			var rules = Manager.widgets["ruler"].ruler.getActiveRules();
			var model = Manager.widgets["ruler"].rules;
			var selectorTR ="",selectorTD ="";
			for (var i=0;i<rules.length;i++){
				selectorTR ="";
				selectorTD ="";
				var rule=rules[i];
				if (rule.target==model.target[0].name){ //Proteins
					switch (rule.condition){
						case model.target[0].conditions[0].name: // all
							selectorTD = ".cell_"+self.columns[0].id+", .cell_"+self.columns[2].id+"";
							break;
						case model.target[0].conditions[1].name: // interactions with
							selectorTR = "tr[id*="+rule.parameters[0]+"], tr[id*="+rule.parameters[0]+"]";
							selectorTD = ".cell_"+self.columns[0].id+", .cell_"+self.columns[2].id+"";
							break;
						case model.target[0].conditions[4].name: // features
							var added=[];
							for (var j in self.trIds){
								var node = self.trIds[j];
								
								var doc= self.oTable.$('tr', {"filter": "applied"}).filter("#"+node).data("doc");
								
								var p1key="p1_"+rule.parameters[0],
									p2key="p2_"+rule.parameters[0];
								if (rule.parameters[0]=="id"){
									p1key=self.columns[0].id;
									p2key=self.columns[2].id;
								}
								switch (rule.parameters[1]){
									case "equals":
										if  (doc[p1key] == rule.parameters[2] )
											if (added.indexOf(doc[self.columns[0].id])==-1){
												selectorTD += " .cell_"+self.columns[0].id+"[content=\""+doc[self.columns[0].id]+"\"], .cell_"+self.columns[2].id+"[content=\""+doc[self.columns[0].id]+"\"],";
												added.push(doc[self.columns[0].id]);
											}
										if  (doc[p2key] == rule.parameters[2] )
											if (added.indexOf(doc[self.columns[2].id])==-1){
												selectorTD += " .cell_"+self.columns[0].id+"[content=\""+doc[self.columns[2].id]+"\"], .cell_"+self.columns[2].id+"[content=\""+doc[self.columns[2].id]+"\"],";
												added.push(doc[self.columns[2].id]);
											}
										break;
									case "contains":
										if  (doc[p1key].indexOf(rule.parameters[2])!=-1)
											if (added.indexOf(doc[self.columns[0].id])==-1){
												selectorTD += " .cell_"+self.columns[0].id+"[content=\""+doc[self.columns[0].id]+"\"], .cell_"+self.columns[2].id+"[content=\""+doc[self.columns[0].id]+"\"],";
												added.push(doc[self.columns[0].id]);
											}
										if  (doc[p2key].indexOf(rule.parameters[2])!=-1)
											if (added.indexOf(doc[self.columns[2].id])==-1){
												selectorTD += " .cell_"+self.columns[0].id+"[content=\""+doc[self.columns[2].id]+"\"], .cell_"+self.columns[2].id+"[content=\""+doc[self.columns[2].id]+"\"],";
												added.push(doc[self.columns[2].id]);
											}
										break;
									case "different":
										if  (doc[p1key] != rule.parameters[2] )
											if (added.indexOf(doc[self.columns[0].id])==-1){
												selectorTD += " .cell_"+self.columns[0].id+"[content=\""+doc[self.columns[0].id]+"\"], .cell_"+self.columns[2].id+"[content=\""+doc[self.columns[0].id]+"\"],";
												added.push(doc[self.columns[0].id]);
											}
										if  (doc[p2key] != rule.parameters[2] )
											if (added.indexOf(doc[self.columns[2].id])==-1){
												selectorTD += " .cell_"+self.columns[0].id+"[content=\""+doc[self.columns[2].id]+"\"], .cell_"+self.columns[2].id+"[content=\""+doc[self.columns[2].id]+"\"],";
												added.push(doc[self.columns[2].id]);
											}
										break;
									case "not contains":
										if  (doc[p1key].indexOf(rule.parameters[2])==-1)
											if (added.indexOf(doc[self.columns[0].id])==-1){
												selectorTD += " .cell_"+self.columns[0].id+"[content=\""+doc[self.columns[0].id]+"\"], .cell_"+self.columns[2].id+"[content=\""+doc[self.columns[0].id]+"\"],";
												added.push(doc[self.columns[0].id]);
											}
										if  (doc[p2key].indexOf(rule.parameters[2])==-1)
											if (added.indexOf(doc[self.columns[2].id])==-1){
												selectorTD += " .cell_"+self.columns[0].id+"[content=\""+doc[self.columns[2].id]+"\"], .cell_"+self.columns[2].id+"[content=\""+doc[self.columns[2].id]+"\"],";
												added.push(doc[self.columns[2].id]);
											}
										break;
								}
							}
							if (selectorTD.length>0) selectorTD = selectorTD.substring(0, selectorTD.length-1);
							break;
						case model.target[0].conditions[3].name: // accession number
							switch (rule.parameters[0]){
								case "equals":
									selectorTD = ".cell_"+self.columns[0].id+"[content=\""+rule.parameters[1]+"\"], .cell_"+self.columns[2].id+"[content=\""+rule.parameters[1]+"\"]";
									break;
								case "contains":
									selectorTD = ".cell_"+self.columns[0].id+"[content *=\""+rule.parameters[1]+"\"], .cell_"+self.columns[2].id+"[content *=\""+rule.parameters[1]+"\"]";
									break;
								case "different":
									selectorTD = ".cell_"+self.columns[0].id+":not([content=\""+rule.parameters[1]+"\"]), .cell_"+self.columns[2].id+":not([content=\""+rule.parameters[1]+"\"])";
									break;
								case "not contains":
									selectorTD =".cell_"+self.columns[0].id+":not([content *=\""+rule.parameters[1]+"\"]),.cell_"+self.columns[2].id+":not([content *=\""+rule.parameters[1]+"\"])";
									break;

							}
							break;
						case model.target[0].conditions[2].name: // number of interactions
							for (var pos in self.ids){
								var id= self.ids[pos];
								
								var len = self.oTable.$('tr', {"filter": "applied"}).filter("[id *=\""+id+"\"]").length;
								
								switch (rule.parameters[0]){
									case "==":
										if (1*len==1*rule.parameters[1])
											selectorTD +=" .cell_"+self.columns[0].id+"[content=\""+id+"\"], .cell_"+self.columns[2].id+"[content=\""+id+"\"],";
										break;
									case ">":
										if (1*len>1*rule.parameters[1])
											selectorTD +=" .cell_"+self.columns[0].id+"[content=\""+id+"\"], .cell_"+self.columns[2].id+"[content=\""+id+"\"],";
										break;
									case "<":
										if (1*len<1*rule.parameters[1])
											selectorTD +=" .cell_"+self.columns[0].id+"[content=\""+id+"\"], .cell_"+self.columns[2].id+"[content=\""+id+"\"],";
										break;
									case "<=":
										if (1*len<=1*rule.parameters[1])
											selectorTD +=" .cell_"+self.columns[0].id+"[content=\""+id+"\"], .cell_"+self.columns[2].id+"[content=\""+id+"\"],";
										break;
									case ">=":
										if (1*len>=1*rule.parameters[1])
											selectorTD +=" .cell_"+self.columns[0].id+"[content=\""+id+"\"], .cell_"+self.columns[2].id+"[content=\""+id+"\"],";
										break;
								}
							}
							if (selectorTD.length>0) selectorTD = selectorTD.substring(0, selectorTD.length-1);
							break;
					}
					if (selectorTR!="" || selectorTD!="") switch (rule.action.name){
						case "Hide":
							self.hideCell(selectorTR,selectorTD);
							break;
						case "Show":
							self.showCell(selectorTR,selectorTD);
							break;
						case "Highlight":
							self.paintCell(selectorTR,selectorTD,"#00ff00");
							break;
						case "Border":
							self.paintBorderCell(selectorTR,selectorTD,rule.actionParameters[0]);
							break;
						case "Color":
							self.paintCell(selectorTR,selectorTD,rule.actionParameters[0]);
							break;
						case "Color By":
						case "Border By":
							var type = (rule.action.name=="Color By")?"color":"border";
							if (rule.actionParameters[0]=="Protein Queried")
								self.colorBySeed(selectorTR,selectorTD,type);
							else
								self.colorByFeature(selectorTR,selectorTD,rule.actionParameters[0],type);
							break;
						case "Resize":
							self.resizeCell(selectorTR,selectorTD,rule.actionParameters[0]);
							break;
						case "Resize By":
							self.resizeByFeature(selectorTR,selectorTD,rule.actionParameters[0],type);
							break;
					}
				} else if (rule.target==model.target[1].name) { //Interactions
					var selectorTR ="";
					switch (rule.condition){
						case model.target[1].conditions[0].name: // all
							selectorTR ="tr[id *=cell_]";
							break;
						case model.target[1].conditions[1].name: // protein
							selectorTR ="tr[id*="+rule.parameters[0]+"]";
							break;
						case model.target[1].conditions[2].name: // proteins
							selectorTR ="tr#cell_"+rule.parameters[0]+"_"+rule.parameters[1]+", tr#cell_"+rule.parameters[1]+"_"+rule.parameters[2];
							break;
						case model.target[1].conditions[3].name: // score
							for (var j in self.trIds){
								var node = self.trIds[j];
								
								var doc= self.oTable.$('tr', {"filter": "applied"}).filter("#"+node).data("doc");
								var score=doc[self.fields["score"]];
								if (score!="" && score!="-" ){
									score=score*1.0;
									switch (rule.parameters[0]){
										case "==":
											if (score==1*rule.parameters[1])
												selectorTR +=" #"+node+",";
											break;
										case ">":
											if (score>1*rule.parameters[1])
												selectorTR +=" #"+node+",";
											break;
										case "<":
											if (score<1*rule.parameters[1])
												selectorTR +=" #"+node+",";
											break;
										case "<=":
											if (score<=1*rule.parameters[1])
												selectorTR +=" #"+node+",";
											break;
										case ">=":
											if (score>=1*rule.parameters[1])
												selectorTR +=" #"+node+",";
											break;
									}
								}
							}
							if (selectorTR.length>0) selectorTR = selectorTR.substring(0, selectorTR.length-1);
							break;
						case model.target[1].conditions[4].name: // type of evidence
							for (var j in self.trIds){
								var node = self.trIds[j];
								
								var doc= self.oTable.$('tr', {"filter": "applied"}).filter("#"+node).data("doc");
								var score=doc[rule.parameters[0]];
								if (typeof score != "undefined" && score!="" && score!="-" && score*1>0.0){
									selectorTR +=" #"+node+",";
								}
							}
							if (selectorTR.length>0) selectorTR = selectorTR.substring(0, selectorTR.length-1);
							break;
					}
					if (selectorTR!="") switch (rule.action.name){
						case "Hide":
							self.hideCell(selectorTR,selectorTD);
							break;
						case "Show":
							self.showCell(selectorTR,selectorTD);
							break;
						case "Highlight":
							self.paintRowBackground(selectorTR,"#00ff00");
							break;
						case "Border":
							self.paintRowBackground(selectorTR,rule.actionParameters[0]);
							break;
					}
				}
			}
		};	  	
		$.fn.ruler.applyRulesHeatmap = function(self){
			if (!$("#"+self.target).is(':visible')) return;

			var rules = Manager.widgets["ruler"].ruler.getActiveRules();
			var model = Manager.widgets["ruler"].rules;

			var selector ="";
			if (Object.keys(self.graph.interactionsA).length>0) //making sure there is anything in the graph to apply a rule
				for (var i=0;i<rules.length;i++){
					selector ="";
					var rule=rules[i];
					if (rule.target==model.target[0].name){ //Proteins
						var prefix ="label_";
						var prefix2 =".legend";
						switch (rule.condition){
							case model.target[0].conditions[1].name: // interactions with
								if (typeof self.graph.interactionsA[rule.parameters[0]] == "undefined") 
									selector="";
								else{
									for (var j=0;j<self.graph.interactionsA[rule.parameters[0]].length;j++){
										selector +="[id ="+prefix+"left_"+self.graph.interactionsA[rule.parameters[0]][j].id+"],";
										selector +="[id ="+prefix+"right_"+self.graph.interactionsA[rule.parameters[0]][j].id+"],";
									}
									selector = selector.substring(0, selector.length-1);
								}
								break;
							case model.target[0].conditions[2].name: // number of interactions
								for (var interaction in self.graph.interactionsA){
									switch (rule.parameters[0]){
										case "==":
											if (self.graph.interactionsA[interaction].length==1*rule.parameters[1])
												selector +="[id="+prefix+"right_"+interaction+"],[id="+prefix+"left_"+interaction+"],";
											break;
										case ">":
											if (self.graph.interactionsA[interaction].length>1*rule.parameters[1])
												selector +="[id="+prefix+"right_"+interaction+"],[id="+prefix+"left_"+interaction+"],";
											break;
										case "<":
											if (self.graph.interactionsA[interaction].length<1*rule.parameters[1])
												selector +="[id="+prefix+"right_"+interaction+"],[id="+prefix+"left_"+interaction+"],";
											break;
										case "<=":
											if (self.graph.interactionsA[interaction].length<=1*rule.parameters[1])
												selector +="[id="+prefix+"right_"+interaction+"],[id="+prefix+"left_"+interaction+"],";
											break;
										case ">=":
											if (self.graph.interactionsA[interaction].length>=1*rule.parameters[1])
												selector +="[id="+prefix+"right_"+interaction+"],[id="+prefix+"left_"+interaction+"],";
											break;
									}
								}
								if (selector.length>0) selector = selector.substring(0, selector.length-1);
								break;
							case model.target[0].conditions[3].name: // accession number
								switch (rule.parameters[0]){
									case "equals":
										selector ="#"+prefix+"left_"+rule.parameters[1]+",#"+prefix+"right_"+rule.parameters[1];
										break;
									case "contains":
										selector =prefix2+"[id *=\""+rule.parameters[1]+"\"]";
										break;
									case "different":
										selector =prefix2+':not([id$="_'+rule.parameters[1]+'"])';
										break;
									case "not contains":
										selector =prefix2+":not([id *="+rule.parameters[1]+"])";
										break;
								}
								break;
							case model.target[0].conditions[4].name: // features
								var nodes= self.graph.proteins;
								for (var j in nodes){
									var node = nodes[j];
									var value= node.features[rule.parameters[0]];
									switch (rule.parameters[1]){
										case "equals":
											if  (value == rule.parameters[2] )
												selector +="[id$="+prefix+"left_"+node.id+"],[id$="+prefix+"right_"+node.id+"],";
											break;
										case "contains":
											if (value.indexOf(rule.parameters[2])!=-1)
												selector +="[id="+prefix+"left_"+node.id+"],[id$="+prefix+"right_"+node.id+"],";
											break;
										case "different":
											if (value!=rule.parameters[2]){
												selector +="[id="+prefix+"left_"+node.id+"],[id$="+prefix+"right_"+node.id+"],";
											}
											break;
										case "not contains":
											if (value.indexOf(rule.parameters[2])==-1)
												selector +="[id="+prefix+"left_"+node.id+"],[id$="+prefix+"right_"+node.id+"],";
											break;
									}
								}
								if (selector.length>0) selector = selector.substring(0, selector.length-1);
								break;
							case model.target[0].conditions[0].name: // all
								selector = prefix2;
								break;
						}
					} else if (rule.target==model.target[1].name){ //Interactions
						var prefix ="cell_";
						var prefix2 =".cell";
						switch (rule.condition){
						case model.target[1].conditions[1].name: // protein
							selector =prefix2+"[id *="+rule.parameters[0]+"]";
							break;
						case model.target[1].conditions[2].name: // proteins
							selector =prefix2+"[id *="+rule.parameters[0]+"][id *="+rule.parameters[1]+"]";
							break;
						case model.target[1].conditions[3].name: // score
							var links= self.graph.interactions;
							for (var j in links){
								var link = links[j];
								var score=link["score"];
								switch (rule.parameters[0]){
									case "==":
										if (1*score==1*rule.parameters[1])
											selector +="#"+prefix+link.id+",";
										break;
									case ">":
										if (1*score>1*rule.parameters[1])
											selector +="#"+prefix+link.id+",";
										break;
									case "<":
										if (1*score<1*rule.parameters[1])
											selector +="#"+prefix+link.id+",";
										break;
									case "<=":
										if (1*score<=1*rule.parameters[1])
											selector +="#"+prefix+link.id+",";
										break;
									case ">=":
										if (1*score>=1*rule.parameters[1])
											selector +="#"+prefix+link.id+",";
										break;
								}
							}
							if (selector.length>0) selector = selector.substring(0, selector.length-1);
							break;
						case model.target[1].conditions[4].name: // type of evidence
							var links= self.graph.interactions;
							for (var j in links){
								var link = links[j];
								var score=link.doc[rule.parameters[0]];
								if (typeof score != "undefined" && score*1>0.0){
									selector +="#"+prefix+link.id+",";
								}
							}
							if (selector.length>0) selector = selector.substring(0, selector.length-1);
							break;
						case model.target[0].conditions[0].name: // all
							selector = prefix2;
							break;
						}
					}
					if (selector!="") switch (rule.action.name){
						case "Hide":case "Hide Label":
							self.graph.hide(selector);
							break;
						case "Show":
							self.graph.show(selector);
							break;
						case "Show Label":
							self.graph.showLegend(selector,rule.actionParameters[0]);
							break;
						case "Highlight":
							self.graph.highlight(selector);
							break;
						case "Border":
							self.graph.setColor(selector,rule.actionParameters[0]); 
							self.graph.addLegends([rule.condition+" "+rule.parameters.join(" ")],"Border ("+rule.target+")",rule.actionParameters[0]);
							break;
						case "Color":
							self.graph.setFillColor(selector,rule.actionParameters[0]);
							self.graph.addLegends([rule.condition+" "+rule.parameters.join(" ")],"Color",rule.actionParameters[0]);
							break;
						case "Color By":
						case "Border By":
							var type = (rule.action.name=="Color By")?"color":"border";
							if (rule.target==model.target[0].name){
								if (rule.actionParameters[0]=="Protein Queried"){
									self.colorBySeed(self,".row "+selector,type);
									self.colorBySeed(self,".column "+selector,type,false);
								}else{
									self.colorByFeature(self,rule.actionParameters[0],".row "+selector,type);
									self.colorByFeature(self,rule.actionParameters[0],".column "+selector,type,false);
								}
							}else
								self.colorInteractionByFeature(self,rule.actionParameters[0],selector,type);
							break;
						case "Resize":
							self.graph.setSizeScale(selector,rule.actionParameters[0]);
							break;
						case "Resize By":
							try{
								self.resizeByFeature(self,rule.actionParameters[0],".row "+selector);
								self.resizeByFeature(self,rule.actionParameters[0],".column "+selector,false);
							}catch(err){
								selector="-1";
								self.manager.widgets["ruler"].ruler.warningMessage(rule.id,"At least one of the values of the selected feature is not numeric");
								self.manager.widgets["ruler"].ruler.setAffectedByRule(rule.id,affected);
	
							}
							break;
						case "Font Size":
							self.graph.setSizeScale(selector,rule.actionParameters[0]/14);
							break;
						case "Opacity":
							self.graph.setOpacity(selector,rule.actionParameters[0]);
							break;
						case "Opacity By":
							try{
								self.opacityByFeature(self,rule.actionParameters[0],selector,rule.target==model.target[0].name);
							}catch(err){
								selector="-1";
								self.manager.widgets["ruler"].ruler.warningMessage(rule.id,"At least one of the values of the selected feature is not numeric");
							}
							break;
					}
				}
		};	  	
  });
})(jQuery);
  