(function($){$.se={prompt:function(message,title,callback){if(title==null)title='Prompt';$.se._show(title,message,null,'prompt',function(result){if(callback)callback(result);});},_show:function(title,msg,value,type,callback){$.alerts._hide();$.alerts._overlay('show');$("BODY").append('<div id="popup_container">'+'<h1 id="popup_title"></h1>'+'<div id="popup_content">'+'<div id="popup_message"></div>'+'</div>'+'</div>');if($.alerts.dialogClass)$("#popup_container").addClass($.alerts.dialogClass);var pos=($.browser.msie)?'absolute':'fixed';$("#popup_container").css({position:pos,zIndex:99999,padding:0,margin:0});$("#popup_title").text(title);$("#popup_content").addClass(type);$("#popup_message").text(msg);$("#popup_message").html($("#popup_message").text().replace(/\n/g,'<br />'));$("#popup_container").css({minWidth:$("#popup_container").outerWidth(),maxWidth:$("#popup_container").outerWidth()});$.alerts._reposition();$.alerts._maintainPosition(true);switch(type){case'alert':$("#popup_message").after('<div id="popup_panel"><input type="button" value="'+$.alerts.okButton+'" id="popup_ok" /></div>');$("#popup_ok").click(function(){$.alerts._hide();callback(true);});$("#popup_ok").focus().keypress(function(e){if(e.keyCode==13||e.keyCode==27)$("#popup_ok").trigger('click');});break;case'confirm':$("#popup_message").after('<div id="popup_panel"><input type="button" value="'+$.alerts.okButton+'" id="popup_ok" /> <input type="button" value="'+$.alerts.cancelButton+'" id="popup_cancel" /></div>');$("#popup_ok").click(function(){$.alerts._hide();if(callback)callback(true);});$("#popup_cancel").click(function(){$.alerts._hide();if(callback)callback(false);});$("#popup_cancel").focus();$("#popup_ok, #popup_cancel").keypress(function(e){if(e.keyCode==13)$("#popup_cancel").trigger('click');if(e.keyCode==27)$("#popup_cancel").trigger('click');});break;case'prompt':$("#popup_message").after('<div id="popup_panel"><input type="button" value="'+$.alerts.okButton+'" id="popup_ok" /> <input type="button" value="'+$.alerts.cancelButton+'" id="popup_cancel" /></div>');$("#popup_prompt").width($("#popup_message").width());$("#popup_ok").click(function(){$.alerts._hide();if(callback)callback(true);});$("#popup_cancel").click(function(){$.alerts._hide();if(callback)callback(false);});$("#popup_prompt, #popup_ok, #popup_cancel").keypress(function(e){if(e.keyCode==13)$("#popup_ok").trigger('click');if(e.keyCode==27)$("#popup_cancel").trigger('click');});if(value)$("#popup_prompt").val(value);$("#popup_prompt").focus().select();break;}
if($.alerts.draggable){try{$("#popup_container").draggable({handle:$("#popup_title")});$("#popup_title").css({cursor:'move'});}catch(e){}}}}
;sePrompt=function(message,title,callback){$.se.prompt(message,title,callback);};})(jQuery);