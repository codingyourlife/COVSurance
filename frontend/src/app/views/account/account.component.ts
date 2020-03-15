import { Component, OnInit } from '@angular/core'
import {
  DataService,
  Investment,
  CaluclatedInvestment,
} from 'app/shared/services/data.service'
import { egretAnimations } from 'app/shared/animations/egret-animations'

interface ComulatedInvestmentDisplay {
  risk: string
  month: string
  sum: string
  bonus: string
}

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
  animations: egretAnimations,
})
export class AccountComponent implements OnInit {
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
  myInvestments: ComulatedInvestmentDisplay[] = []
  tempInvestments: ComulatedInvestmentDisplay[] = []
  myInsurances: ComulatedInvestmentDisplay[] = []
  tempInsurances: ComulatedInvestmentDisplay[] = []

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

  constructor(private dataService: DataService) {
    this.myInvestments = this.tempInvestments = this.mapInvestmentDataToDisplayData(
      this.dataService.myInvestments,
    )
    this.myInsurances = this.tempInsurances = this.mapInsuranceDataToDisplayData(
      this.dataService.myInsurances,
    )
  }

  ngOnInit() {}

  private mapInvestmentDataToDisplayData(
    data: Investment[],
  ): ComulatedInvestmentDisplay[] {
    return data
      .sort(
        (investment1: Investment, investment2: Investment) =>
          investment1.sum - investment2.sum,
      )
      .map((investment: Investment) => {
        const timeFrame: string = `${
          AccountComponent.months[investment.month]
        } ${investment.year}`
        return {
          risk: investment.risk,
          bonus: `${(investment.sum * investment.bonus).toFixed(2)} €`,
          sum: investment.sum.toLocaleString() + ' €',
          month: timeFrame,
        }
      })
  }

  private mapInsuranceDataToDisplayData(
    data: CaluclatedInvestment[],
  ): ComulatedInvestmentDisplay[] {
    return data
      .sort(
        (
          investment1: CaluclatedInvestment,
          investment2: CaluclatedInvestment,
        ) => investment1.totalBonus - investment2.totalBonus,
      )
      .map((investment: CaluclatedInvestment) => {
        const timeFrame: string = `${
          AccountComponent.months[investment.subInvestments[0].month]
        } ${investment.subInvestments[0].year}`
        const sum = investment.subInvestments
          .map(invest => invest.sum)
          .reduce((prev, curr) => prev + curr)
        return {
          risk: investment.subInvestments[0].risk,
          bonus: `${(investment.averageBonusPercent * sum).toFixed(2)} €`,
          sum: sum.toLocaleString() + ' €',
          month: timeFrame,
        }
      })
  }

  updateInsuranceFilter(event) {
    const val = event.target.value.toLowerCase()
    var columns = Object.keys(this.tempInsurances[0])
    // Removes last "$$index" from "column"
    columns.splice(columns.length - 1)

    // console.log(columns);
    if (!columns.length) return

    const rows = this.tempInsurances.filter(function(d) {
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

    this.myInsurances = rows
  }

  updateInvestmentFilter(event) {
    const val = event.target.value.toLowerCase()
    var columns = Object.keys(this.tempInvestments[0])
    // Removes last "$$index" from "column"
    columns.splice(columns.length - 1)

    // console.log(columns);
    if (!columns.length) return

    const rows = this.tempInvestments.filter(function(d) {
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

    this.myInvestments = rows
  }
}
