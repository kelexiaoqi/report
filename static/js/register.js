$(document).ready(function () {
  $('#register-btn').click(function (event) {
    event.preventDefault();
    let username = $('#username').val();
    let password = $('#password').val();
    let repeatPassword = $('#repeatPassword').val();
    let nickname = $('#nickname').val();
    let email = $('#email').val();
    let gender = $('input[name="gender"]:checked').val();
    let birthdate = $('#birthdate').val();
    let role = 'user';
    let fileInput = $('#profileImage')[0];
    let emailRegEx = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    let allowedImageFormats = ['png', 'jpg'];
    let file = fileInput.files.length > 0 ? fileInput.files[0] : null;
    let fileExtension = file ? file.name.split('.').pop().toLowerCase() : '';

    if (!username || !password || !nickname || !email || !gender || !birthdate) {
      alert('Please fill in all fields');
      return;
    } else if (password !== repeatPassword) {
      alert('Password mismatch!');
      return;
    } else if (!emailRegEx.test(email)) {
      alert('Invalid email format.');
      return;
    } else if (!allowedImageFormats.includes(fileExtension)) {
      alert('Invalid image format. Only .png or .jpg');
      return;
    }

    let formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('nickname', nickname);
    formData.append('email', email);
    formData.append('gender', gender);
    formData.append('birthdate', birthdate);
    formData.append('role', role);
    formData.append('profileImage', file);

    $.ajax({
      url: '/auth/register',
      type: 'POST',
      data: formData,
      dataType: 'json',
      processData: false,
      contentType: false,
      success: function (data) {
        if (data.status === 'success') {
          alert(`Welcome, ${data.user.username}!\nYou can login with your account now!`);
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
