/**
 * Age distribution analyzer
 */

class AgeDistribution {
  /**
   * Calculate age distribution statistics
   * @param {Array} records - Array of records with age property
   * @returns {Object} Age distribution with percentages
   */
  static calculate(records) {
    if (!records || records.length === 0) {
      return {
        totalRecords: 0,
        distributions: {
          lessThan20: { count: 0, percentage: 0 },
          from20to40: { count: 0, percentage: 0 },
          from40to60: { count: 0, percentage: 0 },
          greaterThan60: { count: 0, percentage: 0 },
        },
      };
    }

    let lessThan20 = 0;
    let from20to40 = 0;
    let from40to60 = 0;
    let greaterThan60 = 0;

    // Count records in each age group
    for (const record of records) {
      const age = parseInt(record.age, 10);

      if (age < 20) {
        lessThan20++;
      } else if (age >= 20 && age < 40) {
        from20to40++;
      } else if (age >= 40 && age < 60) {
        from40to60++;
      } else if (age >= 60) {
        greaterThan60++;
      }
    }

    const total = records.length;

    return {
      totalRecords: total,
      distributions: {
        lessThan20: {
          count: lessThan20,
          percentage: ((lessThan20 / total) * 100).toFixed(2),
        },
        from20to40: {
          count: from20to40,
          percentage: ((from20to40 / total) * 100).toFixed(2),
        },
        from40to60: {
          count: from40to60,
          percentage: ((from40to60 / total) * 100).toFixed(2),
        },
        greaterThan60: {
          count: greaterThan60,
          percentage: ((greaterThan60 / total) * 100).toFixed(2),
        },
      },
    };
  }

  /**
   * Print age distribution report to console
   * @param {Object} distribution - Distribution object from calculate()
   */
  static printReport(distribution) {
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║     Age-Group % Distribution Report        ║');
    console.log('╚════════════════════════════════════════════╝\n');

    console.log(`Total Records Processed: ${distribution.totalRecords}\n`);

    console.log('Age Group          Count    Percentage');
    console.log('─────────────────────────────────────');

    const { distributions } = distribution;

    console.log(
      `< 20               ${distributions.lessThan20.count.toString().padEnd(8)} ${distributions.lessThan20.percentage}%`
    );
    console.log(
      `20 to 40           ${distributions.from20to40.count.toString().padEnd(8)} ${distributions.from20to40.percentage}%`
    );
    console.log(
      `40 to 60           ${distributions.from40to60.count.toString().padEnd(8)} ${distributions.from40to60.percentage}%`
    );
    console.log(
      `> 60               ${distributions.greaterThan60.count.toString().padEnd(8)} ${distributions.greaterThan60.percentage}%`
    );

    console.log('─────────────────────────────────────\n');
  }
}

module.exports = AgeDistribution;
