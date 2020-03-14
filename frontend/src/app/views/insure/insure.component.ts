import { Component, OnInit } from '@angular/core'
import { egretAnimations } from 'app/shared/animations/egret-animations'

interface ComulatedInvestments {
  risk: string
  month: string
  sum: string
  bonus: string
}

@Component({
  selector: 'app-insure',
  templateUrl: './insure.component.html',
  styleUrls: ['./insure.component.scss'],
  animations: egretAnimations,
})
export class InsureComponent implements OnInit {
  fakeData: ComulatedInvestments[] = [
    {
      risk: 'Pandemie',
      month: 'Mai 2020',
      sum: '100.000',
      bonus: '10%',
    },
    {
      risk: 'Pandemie',
      month: 'Mai 2020',
      sum: '50.000',
      bonus: '12%',
    },
    {
      risk: 'Pandemie',
      month: 'Juni 2020',
      sum: '70.000',
      bonus: '9%',
    },
    {
      risk: 'Pandemie',
      month: 'August 2020',
      sum: '210.000',
      bonus: '18%',
    },
  ]
  columns = [
    {
      prop: 'risk',
      name: 'Risiko',
    },
    {
      prop: 'month',
      name: 'Monat',
    },
    {
      prop: 'sum',
      name: 'Volumen',
    },
    {
      prop: 'bonus',
      name: 'Prämie',
    },
  ]
  temp = []

  constructor() {
    this.temp = this.fakeData
  }

  ngOnInit() {}

  updateFilter(event) {
    const val = event.target.value.toLowerCase()
    var columns = Object.keys(this.temp[0])
    // Removes last "$$index" from "column"
    columns.splice(columns.length - 1)

    // console.log(columns);
    if (!columns.length) return

    const rows = this.temp.filter(function(d) {
      for (let i = 0; i <= columns.length; i++) {
        let column = columns[i]
        // console.log(d[column]);
        if (
          d[column] &&
          d[column]
            .toString()
            .toLowerCase()
            .indexOf(val) > -1
        ) {
          return true
        }
      }
    })

    this.fakeData = rows
  }
}
