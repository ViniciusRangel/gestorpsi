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

/** 
* client referral list
*/

function updateReferral(url) {
    $.getJSON(url, function(json) {
        // flush list
        $('div#client_referral_list div.client_referral_list table tbody').html('');
        var line = '';
        var zebra = 0;
        jQuery.each(json,  function(){
                var str_professional = ''; 
                var str_professional_inline = ''; 
                var str_service = '';
                
               //append professional list
                jQuery.each(this.professional,  function(){
                    str_professional_inline = str_professional_inline + this.name + ", " ;
                });
                str_professional_inline = str_professional_inline.substr(0, (str_professional_inline.length-2))

                /**
                 * populate events view
                 */
                
                line = line + '<tr class="zebra_' + zebra + '"><td class="title">' + this.service + '<br>' + str_professional_inline + '</td></tr>';
                
                if(zebra==0) zebra = 1; else zebra = 0;
             });

             if(line == '') {
                 line = '<div id="msg_area" class="alert">Este cliente ainda não foi encaminhado.</div>';
             }
             $('div.client_referral_list table tbody').html(line);
             
    });  
               
    return false;
}

/**
 * referral:
 * bind referral 
 */

function bindReferral() {
    $('div.client_referral_list').unbind().ready(function() {
        if($('div#edit_form input[name=object_id]').val()) {
            updateReferral('/referral/client/' + $('div#edit_form input[name=object_id]').val() + '/');
        }
    });
    $('form input[name=referral_type]').unbind().click(function() {
        if($(this).val() == 'subscription') {
            $('label.referral_type_referral').hide();
        }
        if($(this).val() == 'referral') {
            $('label.referral_type_referral').show();
        }
        
    });
}


