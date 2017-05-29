if (this.type === 'translator' && this.languages.length === 0) {
  error('Language', "is required");
}

this.email = this.email.toLowerCase()
this.username = this.username.toLowerCase();

if (this.type === 'tenant') {
  this.password = this.email;
  this.username = this.email;
}