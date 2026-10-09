import type { Skill } from '@/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Props {
  skill: Skill
  actions?: React.ReactNode
}

export default function SkillCard({ skill, actions }: Props) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-snug">{skill.title}</CardTitle>
          <Badge variant={skill.type === 'offer' ? 'success' : 'warning'} className="shrink-0">
            {skill.type === 'offer' ? 'Offering' : 'Wanted'}
          </Badge>
        </div>
        {skill.category && <CardDescription>{skill.category}</CardDescription>}
      </CardHeader>
      {(skill.description || actions) && (
        <CardContent className="flex flex-col gap-3 flex-1 pt-0">
          {skill.description && (
            <p className="text-sm text-muted-foreground line-clamp-3">{skill.description}</p>
          )}
          {actions}
        </CardContent>
      )}
    </Card>
  )
}
