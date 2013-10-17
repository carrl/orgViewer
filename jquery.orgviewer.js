
;(function($) {
    'use strict';
    $.fn.org_viewer = function() {
	this.addClass("org-viewer");

	var my_content = this.html();
	my_content = my_content.replace(/(\r\n|\r|\n)/g, "\n"); // \r\n, \r, \n => \n
	my_content = html_escape(my_content);

	my_content = my_content.replace(/(https?:\/\/\S*)/g, "<a href='$1' target='_blank'>$1</a>");
	var org_obj = org_parser(my_content, 1);
	// show_org_obj(org_obj);
	var new_content = "<div id='org-toolbar'>";
	new_content += "<div style='float:left;'><input type='button' id='org-collapse-all' value='collapse all' /></div>";
	new_content += "<div style='float:right;'><input type='text' id='org-search-word' />&nbsp;<input type='button' id='org-btn-search' value='search' /></div>";
	new_content += "<div style='clear:both;'></div>";
	new_content += "</div>";
	new_content += "<div id='org-detail'><tt>" + org_html(org_obj, 1) + "</tt></div>";

	org_start(this, new_content);
    };

    function html_escape(ahtml) {
	var nhtml = ahtml;
	nhtml = nhtml.replace(/&amp;/g, "&");
	nhtml = nhtml.replace(/&quot;/g, "\"");
	nhtml = nhtml.replace(/&lt;/g, "<");
	nhtml = nhtml.replace(/&gt;/g, ">");
	nhtml = nhtml.replace(/&/g, "&amp;");
	nhtml = nhtml.replace(/\"/g, "&quot;");
	nhtml = nhtml.replace(/</g, "&lt;");
	nhtml = nhtml.replace(/>/g, "&gt;");

	return nhtml;
    };

    function org_parser(content, star_cnt) {
	// convert org-mode text to object

	var org_obj = [];
	var my_content = content;

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
    };

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
    };

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
		if (my_org_obj[i].title.trim() != "") {
		    my_org_html += "<div class='org-content'>" + my_org_obj[i].content + "</div>";
		} else {		// no title
		    my_org_html += "<div class='org-content-sp'>" + my_org_obj[i].content + "</div>";
		}
	    }
	}

	return my_org_html;
    };

    function org_start($obj, content) {
	$obj.html(content);

	$obj.find("#org-detail").css("height", $obj.height() - $obj.find("#org-toolbar").outerHeight() - parseInt(jQuery("#org-detail").css("padding-top")));

	$obj.find("div[class^=star]").bind("click", function() {
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

	$obj.find("#org-collapse-all").click(function() {
	    // when button "collapse all" click
	    var org_next = $obj.find("#org-detail div[class=star1]").next();
	    org_next.attr("lastclick", "0").hide();
	    org_next.find("div[class=org-content]").hide();
	    org_next.find("div[class=org-sub]").hide();
	});

	$obj.find("#org-btn-search").click(function() {
	    // Search
	    var org_search_word = $obj.find("#org-search-word").val();
	    if (org_search_word.trim() != "") {
		var org_search_word_regex = eval("/" + org_search_word + "/g");

		org_start($obj, content);

		$obj.children("#org-detail").find(":contains('" + org_search_word + "')").each(function() {
		    if ($(this).html().indexOf("<") == -1) {
			var searched_content = $(this).html().replace(org_search_word_regex, "<span class='org-search-word'>" + org_search_word + "</span>");
			$(this).html(searched_content);
		    }
		    $(this).show();
		});
	    } else {
		org_start($obj, content);
	    }
	});
    };
}) (jQuery);
