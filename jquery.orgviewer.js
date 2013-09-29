
;(function($) {
    $.fn.org_viewer = function() {
	this.addClass("org-viewer");

	var my_content = this.html();
	var org_obj = org_parser(my_content, 1);
	// show_org_obj(org_obj);
	var new_content = "<div id='org-toolbar'><input type='button' id='org-collapse-all' value='collapse all' /></div>";
	new_content += "<div id='org-content'><tt>" + org_html(org_obj, 1) + "</tt></div>";

	this.html(new_content);

	this.find("#org-content").css("height", this.height() - this.find("#org-toolbar").outerHeight());

	this.find("div[class^=star]").bind("click", function() {
	    // alert("qq");
	    // press (title) show (content)
	    var org_next = $(this).next("div");

	    if (org_next.is(":hidden")) {
		org_next.attr("lastclick", "1");
		org_next.parents("div[lastclick=1]").attr("lastclick", "0");

		org_next.show();
	    } else {
		if ((org_next.attr("lastclick") == 1) && (org_next.find("div[class^=org]").length>0)) {
		    org_next.find("div").show();
		} else {
		    org_next.hide();
		    org_next.find("div[class=org-content]").hide();
		    org_next.find("div[class=org-sub]").hide();
		}
		org_next.attr("lastclick", "0");
	    }
	});

	this.find("#org-collapse-all").click(function() {
	    // when button "collapse all" click
	    var org_mode = $(this).parent().parent();
	    var org_next = org_mode.find("#org-content div[class=star1]").next();
	    org_next.attr("lastclick", "0").hide();
	    org_next.find("div[class=org-content]").hide();
	    org_next.find("div[class=org-sub]").hide();
	});
    };

    function org_parser(content, star_cnt) {
	// convert org-mode text to object

	var org_obj = [];
	var my_content = content;

	my_content = my_content.replace(/(\r\n|\r|\n)/g, "\n"); // \r\n, \r, \n => \n
	var star = "";
	for (var i=0; i<star_cnt; i++) {
	    star += "\\*";
	}
	var REG = eval("/^" + star+ " /m");

	var my_list = my_content.split(REG);

	var star1 = star + "\\*";
	var REG1 = eval("/^" + star1 + " /m");
	if (my_list[0].trim() != "") {   // if first char is "*"
	    var sub_obj = {};
	    sub_obj["title"] = "";
	    sub_obj["content"] = my_list[0];

	    org_obj.push(sub_obj);

	    my_list.shift();
	}
	for (var i=0; i<my_list.length; i++) {
	    if (my_list[i].trim() != "") {
		var sub_list = my_list[i].split(/\n/);
		var org_title = sub_list.shift();
		var org_content = sub_list.join("\n");

		var sub_obj = {};
		sub_obj["title"] = star.replace(/\\/g,"") + " " + org_title;

		if (org_content.search(REG1) != -1) {
		    sub_obj["content"] = org_parser(org_content, star_cnt+1);
		} else {
		    sub_obj["content"] = org_content;
		}
		org_obj.push(sub_obj);
	    }
	}

	return org_obj;
    }

    function show_org_obj(my_org_obj) {
	// show org-mode object (console.log)
	for (var i=0; i<my_org_obj.length; i++) {
	    console.log(my_org_obj[i].title);
	    if (typeof my_org_obj[i].content === "object") {
		show_org_obj(my_org_obj[i].content);
	    } else {
		console.log(my_org_obj[i].content);
	    }
	}
    }

    function org_html(my_org_obj, level) {
	// convert org-mode object to HTML
	var my_org_html = "";

	for (var i=0; i<my_org_obj.length; i++) {
	    if (my_org_obj[i].title.trim() != "") {
		my_org_html += "<div class='star" + level + "'>" +my_org_obj[i].title.replace("\n","") + "</div>";
	    }
	    if (typeof my_org_obj[i].content === "object") {
		my_org_html += "<div class='org-sub'>" +org_html(my_org_obj[i].content, level+1) + "</div>";
	    } else {
		// console.log(my_org_obj[i].content);
		if (my_org_obj[i].title.trim() != "") {
		    my_org_html += "<div class='org-content'>" + my_org_obj[i].content + "</div>";
		} else {		// no title
		    my_org_html += "<div class='org-content-sp'>" + my_org_obj[i].content + "</div>";
		}
	    }
	}

	return my_org_html;
    }
}) (jQuery);
