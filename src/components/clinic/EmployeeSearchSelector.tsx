/**
 * EmployeeSearchSelector Component
 *
 * Auto-complete search untuk karyawan dengan hasil yang mencakup:
 * - Karyawan sendiri
 * - Istri/suami karyawan
 * - Anak-anak karyawan
 *
 * Features:
 * - Fuzzy search by name/NIK
 * - Show employee with division
 * - Show family members grouped by employee
 * - Select callback with full data
 */

import { useState, useEffect } from 'react'
import { Search, Users, User, Baby } from 'lucide-react'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { useEmployees } from '../../hooks'
import type { FamilyMember } from '../../types/clinic-registration'

interface Employee {
  id: string
  employee_id: string
  full_name: string
  division_id: string
  position_id: string
  gender?: string
  birth_date?: string
  phone?: string
  marital_status?: string
  family_data?: any
}

interface EmployeeSearchResult {
  type: 'employee' | 'spouse' | 'child'
  employeeId: string
  employeeNik: string
  employeeName: string
  employeeDivision: string
  memberId?: string
  memberName: string
  memberNik?: string
  memberAge?: number
  memberGender?: string
  memberRelation?: string
  childIndex?: number
}

interface Props {
  onSelect: (result: EmployeeSearchResult) => void
  placeholder?: string
  label?: string
}

export function EmployeeSearchSelector({ onSelect, placeholder, label }: Props) {
  const { employees, fetchEmployees } = useEmployees()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<EmployeeSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    fetchEmployees()
  }, [])

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    searchEmployeeAndFamily()
  }, [searchQuery])

  const searchEmployeeAndFamily = () => {
    setIsSearching(true)
    const query = searchQuery.toLowerCase()
    const results: EmployeeSearchResult[] = []

    employees.forEach((emp: Employee) => {
      // Search in employee name/NIK
      if (
        emp.full_name?.toLowerCase().includes(query) ||
        emp.employee_id?.toLowerCase().includes(query)
      ) {
        // Calculate age from birth_date
        const age = emp.birth_date
          ? new Date().getFullYear() - new Date(emp.birth_date).getFullYear()
          : undefined

        results.push({
          type: 'employee',
          employeeId: emp.id,
          employeeNik: emp.employee_id,
          employeeName: emp.full_name,
          employeeDivision: emp.division_id || '-',
          memberId: emp.id,
          memberName: emp.full_name,
          memberNik: emp.employee_id,
          memberAge: age,
          memberGender: emp.gender,
          memberRelation: 'self',
        })
      }

      // Search in spouse
      if (emp.marital_status === 'married' && emp.family_data?.spouse) {
        const spouse = emp.family_data.spouse
        if (spouse.fullName?.toLowerCase().includes(query)) {
          results.push({
            type: 'spouse',
            employeeId: emp.id,
            employeeNik: emp.employee_id,
            employeeName: emp.full_name,
            employeeDivision: emp.division_id || '-',
            memberId: `${emp.id}-spouse`,
            memberName: spouse.fullName,
            memberNik: spouse.nik,
            memberAge: spouse.birthDate
              ? new Date().getFullYear() - new Date(spouse.birthDate).getFullYear()
              : undefined,
            memberGender: spouse.gender,
            memberRelation: 'spouse',
          })
        }
      }

      // Search in children
      if (emp.family_data?.children && Array.isArray(emp.family_data.children)) {
        emp.family_data.children.forEach((child: any, index: number) => {
          if (child.fullName?.toLowerCase().includes(query)) {
            results.push({
              type: 'child',
              employeeId: emp.id,
              employeeNik: emp.employee_id,
              employeeName: emp.full_name,
              employeeDivision: emp.division_id || '-',
              memberId: `${emp.id}-child-${index}`,
              memberName: child.fullName,
              memberNik: child.nik,
              memberAge: child.birthDate
                ? new Date().getFullYear() - new Date(child.birthDate).getFullYear()
                : undefined,
              memberGender: child.gender,
              memberRelation: 'child',
              childIndex: index,
            })
          }
        })
      }
    })

    setSearchResults(results)
    setShowResults(results.length > 0)
    setIsSearching(false)
  }

  const handleSelect = (result: EmployeeSearchResult) => {
    onSelect(result)
    setSearchQuery(result.memberName)
    setShowResults(false)
  }

  const getRelationBadge = (type: string) => {
    switch (type) {
      case 'employee':
        return <Badge variant="default">Karyawan</Badge>
      case 'spouse':
        return <Badge variant="secondary">Istri/Suami</Badge>
      case 'child':
        return <Badge variant="outline">Anak</Badge>
      default:
        return null
    }
  }

  const getRelationIcon = (type: string) => {
    switch (type) {
      case 'employee':
        return <User className="h-4 w-4" />
      case 'spouse':
        return <Users className="h-4 w-4" />
      case 'child':
        return <Baby className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <div className="relative">
      <Label>{label || 'Cari Karyawan atau Keluarga'}</Label>
      <div className="relative mt-2">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder || 'Ketik nama atau NIK (minimal 2 karakter)...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
          className="pl-10"
        />
      </div>

      {/* Search Results Dropdown */}
      {showResults && searchResults.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-background border rounded-lg shadow-lg max-h-96 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs text-muted-foreground px-2 py-1">
              {searchResults.length} hasil ditemukan
            </div>
            {searchResults.map((result) => (
              <button
                key={result.memberId}
                onClick={() => handleSelect(result)}
                className="w-full text-left px-3 py-3 hover:bg-accent rounded-md transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1">
                    {getRelationIcon(result.type)}
                    <div className="flex-1">
                      <div className="font-medium">{result.memberName}</div>
                      {result.memberNik && (
                        <div className="text-xs text-muted-foreground">
                          NIK: {result.memberNik}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground mt-1">
                        {result.type !== 'employee' && (
                          <>
                            Karyawan: {result.employeeName} ({result.employeeNik})
                            <br />
                          </>
                        )}
                        {result.memberAge && (
                          <>Usia: {result.memberAge} tahun</>
                        )}
                        {result.memberGender && (
                          <> • {result.memberGender === 'male' ? 'Laki-laki' : 'Perempuan'}</>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    {getRelationBadge(result.type)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {showResults && searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
        <div className="absolute z-50 w-full mt-1 bg-background border rounded-lg shadow-lg p-4 text-center text-muted-foreground">
          Tidak ada hasil ditemukan untuk "{searchQuery}"
        </div>
      )}

      {/* Click outside to close */}
      {showResults && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  )
}
