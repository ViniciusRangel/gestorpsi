/**

Copyright (C) 2008 GestorPsi

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

*/

var schedule_options = {
    dateFormat: 'yymmdd',
    'onSelect': function(date) {
        $("div#mini_calendar").hide();
        return updateGrid('/schedule/occurrences/' + date.substr(0,4) + '/' + date.substr(4,2) + '/' + date.substr(6,2) + '/');
    }
}

var dialog_options = {
    modal: true,
    overlay: {
        background: "url(/media/img/transp75.png) repeat"
    },
    autoOpen: false,
    height: "350px",
    width: "500px"
    
}

var occupied_css_class = 'occup';

function updateGrid(url) {
    /** 
    * take data from json view output and put on the schedule daily grid
    */

    $('table.schedule_results.daily tr td.clean').attr('class','clean'); // remove class from lastest event
    $('table.schedule_results.daily tr td.clean a.booked').remove(); // remove booked events
    $('table.schedule_results.daily tr td.clean').attr('rowspan', '1'); // reset rowspans
    $('table.schedule_results.daily tr td.clean').show(); // display hided td's by rowspans
    $('table.schedule_results.daily tr td.clean a.book').show(); // reset grid to free slots on all

    $.getJSON(url, function(json) {
        $('div.schedule span.date_selected').text(json['util']['str_date']); // switch selected date
        $('table.schedule_results.daily tr td.clean a.book').each(function() { // update date ins url
            hour = $(this).parent('td').parent('tr').attr('hour');
            room = $(this).parent('td').attr('room');
            $(this).attr('href', '/schedule/events/add/?dtstart=' + json['util']['date'] + 'T' + hour + '&room='+ room);
            $(this).attr('title', json['util']['str_date']);
        });
        $('div.schedule a.prev_day').attr('href','/schedule/occurrences/'+json['util']['prev_day']+'/');
        $('div.schedule a.next_day').attr('href','/schedule/occurrences/'+json['util']['next_day']+'/');
        jQuery.each(json,  function(){
            if(this.start_time) {
                var str_client = ''; var str_professional = ''; var str_service = '';
                var col = $('table.schedule_results.daily tr[hour=' + this.start_time +'] td[room='+this.room+']');
                
                col.addClass('clean'); // required
                col.addClass('color' + this.css_color_class); // service color
                
                //append client list
                jQuery.each(this.client,  function(){
                    str_client = str_client + this.name + "<br />";
                });

                //append professional list
                jQuery.each(this.professional,  function(){
                    str_professional = str_professional + this.name + "<br />" ;
                    col.addClass('professional_' + this.id); // professionals in cell
                });

                //append service
                str_service = '>>' + this.service + '<br />';
                
                col.addClass('service_' + this.service_id); // service from cell

                label = str_client + str_service + str_professional

                // for occurrences greater than half-hour, change table rowspan
                if (this.rowspan > 1) {
                    // is needed to remove next TD's if last rowspan is greater than 1
                    $('table.schedule_results.daily tr[hour=' + this.start_time +']').nextAll().find('td[room='+this.room+']').slice(0, (parseInt(this.rowspan)-1)).hide(); //css('background-color', 'red');
                    // increase rowspan size 
                    $('table.schedule_results.daily tr[hour=' + this.start_time +'] td[room='+this.room+']').attr('rowspan', this.rowspan);
                }


                
                //$('table.schedule_results.daily tr[hour=' + this.start_time +'] td[room='+this.room+']').attr('class', 'clean color' + this.css_color_class + ); // colorize table cell
                $('table.schedule_results.daily tr[hour=' + this.start_time +'] td[room='+this.room+'] a.book').hide(); // hide free slot 
                $('table.schedule_results.daily tr[hour=' + this.start_time +'] td[room='+this.room+'] a.book').after('<a title="'+json['util']['str_date']+'" occurrence="' + this.id + '" class="booked">' + label + '</a>'); // show booked event
                }
            });
            // hide elements if some filter is activated
            var count = 0;
            var class_name = '';
            $('div.filter a.filter_by').each(function() {
                var el = $(this);
                if(el.attr('status') == 'off' && el.attr('type')) {
                    class_name = el.attr('type') + '_' + el.attr('uuid');
                    $('table.schedule_results.daily tr td.'+class_name + ' a.booked').hide();
                    $('table.schedule_results.daily tr td.'+class_name).addClass(occupied_css_class);
                    //$('table.schedule_results.daily tr td.'+class_name).attr('style','background-color: ' + filter_background);
                }
            });

        }
    );
    
    // bind dialog box
    $('table.schedule_results a.booked').unbind().click(function() {
        $.getJSON('/schedule/occurrence/abstract/'+ $(this).attr('occurrence') +'/', function(json) {
            
            var str_client = ''; var str_professional = '';
            //append client list
            jQuery.each(json.client,  function(){
            str_client = str_client + this.name + ' ' +this.phone+ '<br />' ;
            });

            //append professional list
            jQuery.each(json.professional,  function(){
                str_professional = str_professional + this.name + ' ' +this.phone+ '<br />' ;
            });
            
            $('div#dialog h1[key=date]').text(json['date']);
            $('div#dialog div[key=room]').text(json['room']);
            $('div#dialog div[key=service]').text(json['service']);
            $('div#dialog div[key=client]').html(str_client);
            $('div#dialog div[key=professional]').html(str_professional);
            $('div#dialog a[key=edit_link]').attr('href','/schedule/events/' + json['event_id'] + '/' + json['id'] + '/');
            $('div#dialog a[key=edit_link]').attr('title', json['date']);
        });
        $('div#dialog').dialog('open');
    });
    
    return false;
}

function bindSchedule() {
    // dialog box
    $('div#dialog').dialog(dialog_options);
    
    // hide dialog box in all click    
    $('div#dialog a').click(function() {
            $('div#dialog').dialog('close');
    });
    
    $('div.schedule table.schedule_results').unbind().ready(function() {
        $("div#mini_calendar").datepicker(schedule_options);
        // load today daily occurrences
        updateGrid('/schedule/occurrences/');
    });
    // open mini-calendar
    $('a#calendar_link').unbind().click(function() {
        $("div#mini_calendar").toggle();
    });

    // bind click daily occurrences
    $('div.schedule a.json_ocorrences').unbind().click(function() {
        return updateGrid($(this).attr('href'));
    });
    
    // filters menu. toggle menu list options
    $('div.schedule a.option.toggle').unbind().click(function() {
        var filter = $($(this).attr('display'));
        $('div.schedule div.filter').not(filter).hide();
        $(filter).toggle();
    });
    
    // re-draw the filter menu when clicked
    $('div.schedule a.filter_by').unbind().click(function() {
        var all_selected = $(this).parents('table').children('tbody').children('tr').children('td.all').children('a');
        var all = $(this).parents('table').children('tbody').children('tr').children('td').children('a');
        //var col = 'div.schedule table.schedule_results tr td.' + $(this).attr('type') + '_' + $(this).attr('uuid');
        var img = $(this).parents('table').children('tbody').children('tr').children('td').children('a').children('img');
        
        // first click. 'all itens' button still selected yet. let's hide all, and show only clicked
        if (!$(this).hasClass('all')) {
            if ( all_selected.attr('status') == 'on' ) {
                img.attr('src','/media/img/chk_off.png');
                $(this).children('img').attr('src','/media/img/chk.png');
                all.attr('status','off');
                $(this).attr('status','on');
            } else {
                if($(this).attr('status') == 'on') {
                    $(this).attr('status','off');
                    $(this).children('img').attr('src','/media/img/chk_off.png');
                } else {
                    $(this).attr('status','on');
                    $(this).children('img').attr('src','/media/img/chk.png');
                }
            }
        } else {
            // show all
            if(all_selected.attr('status') == 'off') {
                all.children('img').attr('src','/media/img/chk.png');
                all.attr('status','on');
            } else {
                all.children('img').attr('src','/media/img/chk_off.png');
                all.attr('status','off');
            }
            
        }
        
        // read the filter menu, and rebuild the data grid

        var count = 0;
        var class_name = '';
        $('table.schedule_results.daily tr td').attr('norewrite','false');

        $(this).parents('div').children('table').children('tbody').children('tr').children('td').children('a').each(function() {
            var el = $(this);
            if(el.attr('status') && el.attr('type') && el.attr('uuid')) {
                class_name = el.attr('type') + '_' + el.attr('uuid');
                if(el.attr('status') == 'off') { // switch off
                    if(el.attr('type') == 'service') {
                        $('table.schedule_results.daily tr td.' + class_name + ' a.booked').hide();
                        $('table.schedule_results.daily tr td.' + class_name).addClass(occupied_css_class);
                        $('table.schedule_results.daily tr td.' + class_name).attr('locked', 'on');
                    } else {
                        $('table.schedule_results.daily tr td.' + class_name).each(function() {
                                if($(this).attr('locked') != 'on' && $(this).attr('norewrite') != 'true') {
                                    $(this).children('a.booked').hide();
                                    $(this).addClass(occupied_css_class);
                                }
                            });
                    }
                } else { // switch on
                    if(el.attr('type') == 'service') {
                        $('table.schedule_results.daily tr td.' + class_name + ' a.booked').show();
                        $('table.schedule_results.daily tr td.' + class_name).removeClass(occupied_css_class);
                        $('table.schedule_results.daily tr td.' + class_name).attr('locked', 'off');
                    } else {
                        $('table.schedule_results.daily tr td.' + class_name).each(function() {
                            if($(this).attr('locked') != 'on') {
                                $(this).children('a.booked').show();
                                $(this).removeClass(occupied_css_class);
                                $(this).attr('norewrite','true');
                            }
                        });
                    }
                }
            }
        });
        
        
        
    });
}
