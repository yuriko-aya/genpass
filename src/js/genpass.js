function make_password(length) {
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var result           = '';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        if ((i % 8 == 0) && (i != 0)) {
            result += '-'
        }
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function copy_password() {
    var copyText = document.getElementById("generated_password");
    var cleaned_password = decode_html(copyText.innerHTML)
    navigator.clipboard.writeText(cleaned_password);
    alert("Password copied:\n" + cleaned_password);
}

function escape_html(unsafe)
{
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
 }

function decode_html(html) {
  var txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

function generate_password() {
    var result = make_password(32)
    document.getElementById("generated_password").classList.add('bg-info')
    document.getElementById("generated_password").classList.add('display-3')
    document.getElementById("copy-button").style.display = 'inline-block'
    document.getElementById("generated_password").innerHTML = escape_html(result)
    document.getElementById("main-button").style.display = 'none'
    document.getElementById("left-button").style.display = 'inline-block'
}