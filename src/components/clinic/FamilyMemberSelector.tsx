/**
 * FamilyMemberSelector Component
 *
 * Component untuk menampilkan dan memilih anggota keluarga karyawan
 * setelah karyawan dipilih.
 *
 * Features:
 * - Display employee + family members
 * - Selectable cards
 * - Show complete member info (age, gender, BPJS, etc.)
 */

import { useState, useEffect } from 'react'
import { User, Users, Baby, Check } from 'lucide-react'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { Label } from '../ui/label'
import { usePatients } from '../../hooks'
import type { FamilyMember } from '../../types/clinic-registration'

interface Props {
  employeeId: string
  employeeName: string
  onSelect: (member: FamilyMember, index?: number) => void
  selectedMemberId?: string
}

export function FamilyMemberSelector({
  employeeId,
  employeeName,
  onSelect,
  selectedMemberId,
}: Props) {
  const { getEmployeeFamilyMembers, loading } = usePatients()
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])

  useEffect(() => {
    loadFamilyMembers()
  }, [employeeId])

  const loadFamilyMembers = async () => {
    const { data, error } = await getEmployeeFamilyMembers(employeeId)
    if (data && !error) {
      setFamilyMembers(data)
      // Auto-select first member (employee) if no selection
      if (!selectedMemberId && data.length > 0) {
        onSelect(data[0])
      }
    }
  }

  const getRelationLabel = (relation: string) => {
    switch (relation) {
      case 'self':
        return 'Karyawan'
      case 'spouse':
        return 'Istri/Suami'
      case 'child':
        return 'Anak'
      case 'parent':
        return 'Orang Tua'
      case 'sibling':
        return 'Saudara'
      default:
        return relation
    }
  }

  const getRelationIcon = (relation: string) => {
    switch (relation) {
      case 'self':
        return <User className="h-5 w-5" />
      case 'spouse':
        return <Users className="h-5 w-5" />
      case 'child':
        return <Baby className="h-5 w-5" />
      default:
        return <User className="h-5 w-5" />
    }
  }

  const getGenderLabel = (gender?: string) => {
    return gender === 'male' ? 'Laki-laki' : gender === 'female' ? 'Perempuan' : '-'
  }

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Memuat data keluarga...
      </div>
    )
  }

  if (familyMembers.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Tidak ada data keluarga untuk karyawan ini
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base">Pilih Anggota Keluarga</Label>
        <p className="text-sm text-muted-foreground mt-1">
          Karyawan: {employeeName}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {familyMembers.map((member, index) => {
          const memberId = member.nik || `${employeeId}-${member.relation}-${index}`
          const isSelected = selectedMemberId === memberId

          return (
            <Card
              key={memberId}
              className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'border-primary border-2 bg-primary/5' : ''
              }`}
              onClick={() => onSelect(member, member.relation === 'child' ? index : undefined)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-2 rounded-full ${
                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    {getRelationIcon(member.relation)}
                  </div>

                  <div className="flex-1 space-y-2">
                    {/* Name & Relation */}
                    <div>
                      <div className="font-semibold">{member.fullName}</div>
                      <Badge variant="outline" className="mt-1">
                        {getRelationLabel(member.relation)}
                      </Badge>
                    </div>

                    {/* Details */}
                    <div className="text-sm space-y-1">
                      {/* NIK KTP (National ID) */}
                      {member.nationalId && (
                        <div className="text-muted-foreground">
                          <span className="font-medium">NIK KTP:</span> {member.nationalId}
                        </div>
                      )}

                      {/* Employee ID (for employees only) */}
                      {member.relation === 'self' && member.nik && member.nik !== member.nationalId && (
                        <div className="text-muted-foreground">
                          <span className="font-medium">Kode Karyawan:</span> {member.nik}
                        </div>
                      )}

                      <div className="flex gap-4">
                        {member.age !== undefined && (
                          <div className="text-muted-foreground">
                            <span className="font-medium">Usia:</span> {member.age} tahun
                          </div>
                        )}
                        {member.gender && (
                          <div className="text-muted-foreground">
                            <span className="font-medium">JK:</span> {getGenderLabel(member.gender)}
                          </div>
                        )}
                      </div>

                      {member.bloodType && (
                        <div className="text-muted-foreground">
                          <span className="font-medium">Gol. Darah:</span> {member.bloodType}
                        </div>
                      )}

                      {member.bpjsHealthNumber && (
                        <div className="text-muted-foreground">
                          <span className="font-medium">BPJS:</span> {member.bpjsHealthNumber}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Selected Indicator */}
                {isSelected && (
                  <div className="bg-primary rounded-full p-1">
                    <Check className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {/* Summary */}
      <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
        Total: {familyMembers.length} anggota keluarga terdaftar
      </div>
    </div>
  )
}
