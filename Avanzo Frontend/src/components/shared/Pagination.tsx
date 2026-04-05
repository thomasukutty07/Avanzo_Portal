import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalCount: number
  pageSize: number
  onPageChange: (page: number) => void
}

export function Pagination({
  currentPage,
  totalCount,
  pageSize,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.ceil(totalCount / pageSize)
  if (totalPages <= 1) return null

  return (
    <div className="mt-4 flex items-center justify-between rounded-b-lg border-t bg-muted/20 px-2 py-4">
      <p className="text-xs text-muted-foreground">
        Page <span className="font-bold text-foreground">{currentPage}</span> of{" "}
        {totalPages}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
