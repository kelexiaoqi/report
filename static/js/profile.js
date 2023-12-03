$(document).ready(function () {
  let originalData = {};

  $.ajax({
    url: '/auth/profile',
    type: 'GET',
    success: function (data) {
      $('#username ').val(data.user.username);
      $('#nickname').val(data.user.nickname);
      $('#email').val(data.user.email);
      if (data.user.gender === 'male') {
        $('#male').prop('checked', true);
      } else {
        $('#female').prop('checked', true);
      }
      $('#birthdate').val(data.user.birthdate);
      $('#password').val(data.user.password);
      $('#password2').val(data.user.password2);
      $('.profile-image').attr('src', data.user.profileImage);
      $('.profile-image').css({
        width: '200px',
        height: '200px',
      });
      $('#profile-image-path').val(data.user.profileImage);
    },
    error: function (jqXHR) {
      let errorData = JSON.parse(jqXHR.responseText);
      alert(errorData.message);
    },
  });

  $('#editButton').click(function () {
    $('#profileForm input').prop('readonly', false);
    $('#username').prop('readonly', true);
    $('#male, #female').prop('disabled', false);
    $('#profile-image-path').prop('disabled', false);
    $('#cancelButton, #confirmButton').prop('disabled', false);
    originalData = $('#profileForm').serializeArray();
  });

  $('#cancelButton').click(function () {
    $('#profileForm input').prop('readonly', true);
    $('#male, #female').prop('disabled', true);
    $('#profile-image-path').prop('disabled', true);
    $('#cancelButton, #confirmButton').prop('disabled', true);
    $.each(originalData, function (index, value) {
      console.log(value.name, value.value);
      if (value.name === 'gender') {
        $(`input[name=${value.name}][value=${value.value}]`).prop('checked', true);
      } else {
        $(`input[name="${value.name}"]`).val(value.value);
      }
    });
  });

  $('#profileForm').submit(function (event) {
    event.preventDefault();
    let username = $('#username').val();
    let password = $('#password').val();
    let repeatPassword = $('#password2').val();
    let nickname = $('#nickname').val();
    let email = $('#email').val();
    let gender = $('input[name="gender"]:checked').val();
    let birthdate = $('#birthdate').val();
    let updatedData = new FormData();
    let emailRegEx = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!$('#profile-image-path')[0].files.length) {
      $.each(originalData, function (index, field) {
        if (field.name === 'profile-image-path') {
          updatedData.append('profile-image-path', field.value);
        }
      });
    } else {
      let allowedImageFormats = ['png', 'jpg'];
      let fileInput = $('#profile-image-path')[0];
      let file = fileInput.files.length > 0 ? fileInput.files[0] : null;
      let fileExtension = file ? file.name.split('.').pop().toLowerCase() : '';
      if (!allowedImageFormats.includes(fileExtension)) {
        alert('Invalid image format. Only .png or .jpg');
        return;
      } else {
        updatedData.append('profile-image-path', file);
      }
    }
    if (!username || !password || !nickname || !email || !birthdate) {
      alert('Please fill in all fields');
      return;
    } else if (password !== repeatPassword) {
      alert('Password mismatch!');
      return;
    } else if (!emailRegEx.test(email)) {
      alert('Invalid email format.');
      return;
    }

    updatedData.append('username', username);
    updatedData.append('password', password);
    updatedData.append('nickname', nickname);
    updatedData.append('email', email);
    updatedData.append('gender', gender);
    updatedData.append('birthdate', birthdate);
    $.ajax({
      url: '/auth/profile',
      type: 'POST',
      processData: false,
      contentType: false,
      data: updatedData,
      success: function (data) {
        alert('Profile updated successfully!');
        $('#profileForm input').prop('readonly', true);
        $('#male, #female').prop('disabled', true);
        $('#profile-image-path').prop('disabled', true);
        $('#cancelButton, #confirmButton').prop('disabled', true);
        window.location.href = 'profile.html';
      },
      error: function (jqXHR) {
        let errorData = JSON.parse(jqXHR.responseText);
        alert(errorData.message);
      },
    });
  });

  $('#logout').click(function () {
    let logout = confirm('Confirm to logout?');
    if (logout) {
      $.ajax({
        url: '/auth/logout',
        type: 'POST',
        success: function () {
          window.location.href = 'login.html';
        },
        error: function () {
          alert('Error');
        },
      });
    }
  });
});
