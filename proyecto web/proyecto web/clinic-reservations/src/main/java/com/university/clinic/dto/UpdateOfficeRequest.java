package com.university.clinic.dto;

import com.university.clinic.entity.OfficeStatus;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateOfficeRequest {

    @Size(max = 50)
    private String name;

    private Integer floor;

    private OfficeStatus status;
}
