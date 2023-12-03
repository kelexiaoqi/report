$(document).ready(function () {
  let usernameCookie = getCookie('username');
  let passwordCookie = getCookie('password');
  let rememberCookie = getCookie('remember');
  if (usernameCookie && passwordCookie && rememberCookie === 'true') {
    $('#username').val(usernameCookie);
    $('#password').val(passwordCookie);
    $('#remember').prop('checked', true);
  } else {
    $('#username').val('');
    $('#password').val('');
    $('#remember').prop('checked', false);
  }
  $('#login-button').click(function (event) {
    event.preventDefault();
    let username = $('#username').val();
    let password = $('#password').val();
    if (!username || !password) {
      alert('Username and password cannot be empty');
      return;
    }

    let formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    let remember = $('#remember').is(':checked');
    formData.append('remember', remember);
    $.ajax({
      url: '/auth/login',
      type: 'POST',
      data: formData,
      dataType: 'json',
      processData: false,
      contentType: false,
      success: function (data) {
        if (data.status === 'success') {
          alert(`Logged as ${data.user.username} (${data.user.role})`);
          if (data.user.role == 'user' || data.user.role == 'student') {
            window.location.href = '/event.html';
          } else if (data.user.role == 'admin') {
            window.location.href = '/eventAdmin.html';
          }
        } else {
          alert(data.message);
        }
      },
      error: function (jqXHR) {
        let errorData = JSON.parse(jqXHR.responseText);
        alert(errorData.message);
      },
    });
  });
});

function getCookie(cname) {
  var name = cname + '=';
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
}
