
// This will be called by the admin adapter when the settings page loads
function load(settings, onChange) {
    // example: select elements with id=key and class=value and insert value
    if (!settings) return;
    $('.value').each(function () {
        var $key = $(this);
        var id = $key.attr('id');
        if ($key.attr('type') === 'checkbox') {
            // do not call onChange direct, because onChange could expect some arguments
            $key.prop('checked', settings[id])
                .on('change', () => onChange())
                ;
        } else {
            // do not call onChange direct, because onChange could expect some arguments
            $key.val(settings[id])
                .on('change', () => onChange())
                .on('keyup', () => onChange())
                ;
        }
    });


    onChange(false);
    // reinitialize all the Materialize labels on the page if you are dynamically adding inputs:
    if (M) M.updateTextFields();

}

// This will be called by the admin adapter when the user presses the save button
function save(callback) {
    var ip = ValidateIPaddress();
    if(ip){
    // example: select elements with class=value and build settings object
    var obj = {};
    $('.value').each(function () {
        var $this = $(this);
        if ($this.attr('type') === 'checkbox') {
            obj[$this.attr('id')] = $this.prop('checked');
        } else {
            obj[$this.attr('id')] = $this.val();
        }
    });
    callback(obj);
}}
/*
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('bus0').addEventListener('click',Button0);

});
function Button0(){
    if(document.getElementById('bus0').value){
        console.log("geht")
        document.getElementById('bus0old').value=false;
    }
    else {document.getElementById('bus0old').value=true;}
}
*/
/*
 // workaround for materialize checkbox problem
 $dialogCommand.find('input[type="checkbox"]+span').off('click').on('click', function () {
    var $input = $(this).prev();
    // ignore switch
    if ($input.parent().parent().hasClass('switch')) return;
    if (!$input.prop('disabled')) {
        $input.prop('checked', !$input.prop('checked')).trigger('change');
    }
});
$dialogCommand.find('.btn*').on('click', function () {
    $dialogCommand.modal('close');
});
*/


  

function ValidateIPaddress() {

    const ip = document.getElementById("host").value;
    const ipformat = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if(ip.match(ipformat))
        {return true;}
    else{ M.toast({html: "Invalid IP Address", classes: 'rounded'});
        return false}
}
