package com.university.clinic.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateOfficeRequest {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 50)
    private String name;

    @NotNull(message = "El piso es obligatorio")
    private Integer floor;
}
