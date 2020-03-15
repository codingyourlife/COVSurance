import { Component, OnInit } from '@angular/core'
import { egretAnimations } from 'app/shared/animations/egret-animations'
import { FormGroup, FormControl, Validators } from '@angular/forms'
import { DataService } from 'app/shared/services/data.service'

@Component({
  selector: 'app-invest',
  templateUrl: './invest.component.html',
  styleUrls: ['./invest.component.scss'],
  animations: egretAnimations,
})
export class InvestComponent implements OnInit {
  private static months: string[] = [
    'Jänner',
    'Februar',
    'März',
    'April',
    'Mai',
    'Juni',
    'Juli',
    'August',
    'September',
    'Oktober',
    'November',
    'Dezember',
  ]
  investForm: FormGroup

  readTerm: boolean

  timeframes: { id: number; label: string }[] = []

  constructor(private dataServ: DataService) {
    this.investForm = new FormGroup({
      risk: new FormControl('', Validators.required),
      volume: new FormControl(0, Validators.min(50)),
      bonus: new FormControl(0, Validators.required),
      timeframe: new FormControl('', Validators.required),
      validUntil: new FormControl('', Validators.required),
    })
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    for (let i = currentMonth; i < currentMonth + 13; i++) {
      this.timeframes.push({
        id: i,
        label: `${
          InvestComponent.months[i % InvestComponent.months.length]
        } ${currentYear + Math.floor(i / InvestComponent.months.length)}`,
      })
    }
  }

  invest() {
    const risk = this.investForm.get('risk').value
    const volume = this.investForm.get('volume').value
    const bonus = this.investForm.get('bonus').value
    const timeframe = this.investForm.get('timeframe').value
    const validUntil = this.investForm.get('validUntil').value
    console.log('volume: ', volume)
    console.log('bonus: ', bonus)
    console.log('timeframe: ', timeframe)
    console.log('validUntil: ', validUntil)
    const currentYear = new Date().getFullYear()
    this.dataServ.invest(
      risk,
      volume,
      bonus / 100,
      timeframe % InvestComponent.months.length,
      currentYear + Math.floor(timeframe / InvestComponent.months.length),
      validUntil,
    )
    this.investForm.reset()
  }

  ngOnInit() {}
}
