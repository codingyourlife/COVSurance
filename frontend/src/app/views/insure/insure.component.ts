import { Component, OnInit, ViewChild } from '@angular/core'
import { egretAnimations } from 'app/shared/animations/egret-animations'
import {
  DataService,
  Investment,
  CaluclatedInvestment,
} from 'app/shared/services/data.service'
import { FormGroup, Validators, FormControl } from '@angular/forms'
import { MatExpansionPanel, MatSnackBar } from '@angular/material'

interface ComulatedInvestmentDisplay {
  risk: string
  month: string
  sum: string
  bonus: string
}

interface CalculatedInvestmentDisplay {
  possible: boolean
  totalBonus: number
  averageBonusPercent: number
  subInvestments: ComulatedInvestmentDisplay[]
}

@Component({
  selector: 'app-insure',
  templateUrl: './insure.component.html',
  styleUrls: ['./insure.component.scss'],
  animations: egretAnimations,
})
export class InsureComponent implements OnInit {
  @ViewChild('calculationPanel', { static: false }) calcPanel: MatExpansionPanel
  @ViewChild('inputPanel', { static: false }) inputPanel: MatExpansionPanel
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
  private rawInvestmentData: Investment[] = []
  possibleTimeframes: string[] = []
  possibleRisks: string[] = []
  data: ComulatedInvestmentDisplay[] = []
  columnsInsure = [
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

  columnsOverview = [
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

  insuranceForm: FormGroup
  calculating: boolean
  investmentInProcess: boolean

  calculationResult: CalculatedInvestmentDisplay
  calculationRawResult: CaluclatedInvestment

  invested: boolean

  constructor(private dataService: DataService) {
    this.insuranceForm = new FormGroup({
      risk: new FormControl('', Validators.required),
      timeframe: new FormControl('', Validators.required),
      volume: new FormControl(0, Validators.min(50)),
    })
  }

  async calculateInvestment() {
    this.calculating = true
    const risk: string = this.insuranceForm.get('risk').value
    const timeframe: string = this.insuranceForm.get('timeframe').value
    const month: number = InsureComponent.months.indexOf(
      timeframe.split(' ')[0],
    )
    const year: number = Number(timeframe.split(' ')[1])
    const sum: number = this.insuranceForm.get('volume').value
    this.calculationRawResult = await this.dataService.calculateInvestment(
      risk,
      month,
      year,
      sum,
    )
    this.calculating = false
    this.calculationResult = {
      ...this.calculationRawResult,
      subInvestments: this.mapDataToDisplayData(
        this.calculationRawResult.culminatedSubInvestments,
      ),
    }
    if (this.calculationRawResult.possible) {
      console.log('calc panel: ', this.calcPanel)
      this.inputPanel.close()
      setTimeout(() => {
        this.calcPanel.open()
      }, 100)
    }
  }

  private reset() {
    this.invested = false
    this.calculationRawResult = null
    this.calculationResult = null
    this.insuranceForm.reset()
    this.calcPanel.close()
  }

  confirmInvestment() {
    this.invested = true
    this.investmentInProcess = true
    this.dataService
      .commitInsurance(this.calculationRawResult)
      .then(() => {
        this.investmentInProcess = false
        this.reset()
      })
      .catch(err => {
        console.error(err)
        this.investmentInProcess = false
        this.reset()
      })
  }

  cancelInvestment() {
    this.reset()
  }

  ngOnInit() {}

  async loadData() {
    this.rawInvestmentData = await this.dataService.comulatedInvestments
    this.data = this.temp = this.mapDataToDisplayData(this.rawInvestmentData)
  }

  private mapDataToDisplayData(
    data: Investment[],
  ): ComulatedInvestmentDisplay[] {
    return data
      .sort(
        (investment1: Investment, investment2: Investment) =>
          investment1.sum - investment2.sum,
      )
      .map((investment: Investment) => {
        const timeFrame: string = `${
          InsureComponent.months[investment.month]
        } ${investment.year}`
        if (
          this.possibleTimeframes.findIndex(frame => frame === timeFrame) === -1
        ) {
          this.possibleTimeframes.push(timeFrame)
        }
        if (
          this.possibleRisks.findIndex(risk => risk === investment.risk) === -1
        ) {
          this.possibleRisks.push(investment.risk)
        }
        return {
          risk: investment.risk,
          bonus: `${(investment.bonus * 100).toFixed(2)} %`,
          sum: investment.sum.toLocaleString() + ' €',
          month: timeFrame,
        }
      })
  }

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

    this.data = rows
  }
}
