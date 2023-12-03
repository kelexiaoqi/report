$(document).ready(function () {
  $('#forgetPassword').click(function (event) {
    event.preventDefault();

    let email = $('#email').val();
    let emailRegEx = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    let nickname = $('#nickname').val();
    let birthdate = $('#birthdate').val();
    let password = $('#password').val();
    let repeatPassword = $('#repeatPassword').val();
    if (!nickname || !email || !birthdate || !password) {
      alert('Please fill in all fields');
      return;
    } else if (password !== repeatPassword) {
      alert('Password mismatch!');
      return false;
    } else if (!emailRegEx.test(email)) {
      alert('Invalid email format.');
      return;
    }

    $.ajax({
      url: '/auth/forgetPassword',
      type: 'POST',
      data: {
        email: email,
        nickname: nickname,
        birthdate: birthdate,
        password: password,
      },
      dataType: 'json',
      success: function (data) {
        if (data.status === 'success') {
          alert('Password reset successful!');
          window.location.href = '/login.html';
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
