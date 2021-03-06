var Manager;
(function ($) {
	$(function () {
		if (typeof coreURL=="undefined") coreURL="";
		Manager = new AjaxSolr.Manager({
			solrUrl: server + coreURL +"/"
		});
		for (var i = 0, l = json.length; i < l; i++) {
			Manager.addWidget(new AjaxSolr[json[i]['widget']](json[i]['parameters']));
		}
		Manager.init();
		if ( typeof servlet != "undefined") {
			Manager.servlet=servlet;
			Manager.store.servlet=servlet;
		}
//		if ( typeof Manager.widgets["provenance"] != "undefined") {
//			Manager.widgets["provenance"].addAction("All the widgets have been loaded","loader",json);
//		}
		if ( typeof private_key != "undefined" && private_key != null && private_key != "null")
			params["key"]=private_key;
		
		for (var name in params)
			Manager.store.addByValue(name, params[name]);
//		if ( typeof URLrequests == "undefined" || !Array.isArray(URLrequests) || URLrequests.length<1) {
//			if (getURLParameter("status")==null || getURLParameter("status")=="null"){
//				Manager.store.addByValue('q', '*:*');
//				Manager.doRequest();
//			}
//		}else
		if ( typeof URLrequests != "undefined" && Array.isArray(URLrequests))
			for (var i=0;i<URLrequests.length;i++)
				Manager.widgets["requester"].request([URLrequests[i].id],URLrequests[i].type);
	});

})(jQuery);
