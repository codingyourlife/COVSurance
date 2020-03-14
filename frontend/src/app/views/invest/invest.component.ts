import { Component, OnInit } from '@angular/core'
import { egretAnimations } from 'app/shared/animations/egret-animations'

@Component({
  selector: 'app-invest',
  templateUrl: './invest.component.html',
  styleUrls: ['./invest.component.scss'],
  animations: egretAnimations,
})
export class InvestComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
