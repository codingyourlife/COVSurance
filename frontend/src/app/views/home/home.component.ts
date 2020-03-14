import { Component, OnInit } from '@angular/core'
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms'
import { CustomValidators } from 'ng2-validation'
import { egretAnimations } from 'app/shared/animations/egret-animations'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: egretAnimations,
})
export class HomeComponent implements OnInit {
  signupForm: FormGroup

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    const password = new FormControl('', Validators.required)
    const confirmPassword = new FormControl(
      '',
      CustomValidators.equalTo(password),
    )

    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: password,
      agreed: [false, Validators.required],
    })
  }

  onSubmit() {
    if (!this.signupForm.invalid) {
      // do what you wnat with your data
      console.log(this.signupForm.value)
    }
  }
}
