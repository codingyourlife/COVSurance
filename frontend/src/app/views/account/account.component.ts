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

  investColumns = [
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
      name: 'Investmentsumme',
    },
    {
      prop: 'bonus',
      name: 'Prämie',
    },
  ]

  insureColumns = [
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
      name: 'Versicherungssumme',
    },
    {
      prop: 'bonus',
      name: 'Prämie',
    },
  ]

  hasAccess: boolean

  loadingInvestments: boolean
  loadingInsurances: boolean

  constructor(private dataService: DataService) {
    this.init().catch(err => console.error(err))
    this.dataService
      .hasAccessToBlockchain()
      .then(hasAccess => (this.hasAccess = hasAccess))
      .catch(err => {
        console.error(err)
        this.hasAccess = false
      })
  }

  async init() {
    this.loadingInvestments = true
    this.myInvestments = this.tempInvestments = this.mapInvestmentDataToDisplayData(
      await this.dataService.myInvestments,
      'investment',
    )
    this.loadingInsurances = true
    this.myInsurances = this.tempInsurances = this.mapInvestmentDataToDisplayData(
      await this.dataService.myInsurances,
      'insurance',
    )
  }

  ngOnInit() {}

  private mapInvestmentDataToDisplayData(
    data: Investment[],
    type: 'investment' | 'insurance',
  ): ComulatedInvestmentDisplay[] {
    if (type === 'investment') {
      this.loadingInvestments = false
    } else {
      this.loadingInsurances = false
    }
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
          AccountComponent.months[investment.culminatedSubInvestments[0].month]
        } ${investment.culminatedSubInvestments[0].year}`
        const sum = investment.culminatedSubInvestments
          .map(invest => invest.sum)
          .reduce((prev, curr) => prev + curr)
        return {
          risk: investment.culminatedSubInvestments[0].risk,
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
