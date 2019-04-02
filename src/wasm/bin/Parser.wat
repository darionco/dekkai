(module
  (type (;0;) (func (param i32)))
  (type (;1;) (func (param i32 i32 i32) (result i32)))
  (type (;2;) (func (param i32 i32)))
  (type (;3;) (func (param i32 i32 i32 i32) (result i32)))
  (type (;4;) (func (param i32 i32 i32)))
  (type (;5;) (func (param i32 i32 i32 i32)))
  (import "env" "memory" (memory (;0;) 16 16384))
  (func (;0;) (type 3) (param i32 i32 i32 i32) (result i32)
    (local i32)
    local.get 0
    i32.load
    local.tee 4
    local.get 3
    i32.load offset=16
    i32.ge_u
    if  ;; label = @1
      local.get 2
      return
    end
    local.get 0
    i32.load offset=4
    local.get 3
    i32.load offset=8
    local.get 4
    i32.const 2
    i32.shl
    i32.add
    i32.load
    i32.ge_u
    if  ;; label = @1
      local.get 2
      return
    end
    local.get 2
    local.get 1
    i32.load8_s
    i32.store8
    local.get 2
    i32.const 1
    i32.add)
  (func (;1;) (type 4) (param i32 i32 i32)
    (local i32 i32 i32)
    local.get 0
    i32.load
    local.tee 3
    local.get 1
    i32.load offset=20
    i32.lt_u
    if  ;; label = @1
      block  ;; label = @2
        local.get 2
        i32.load offset=20
        local.set 1
        local.get 0
        i32.load offset=4
        local.tee 2
        i32.eqz
        if  ;; label = @3
          local.get 3
          i32.const 24
          i32.mul
          local.get 1
          i32.add
          local.tee 1
          local.get 1
          i32.load offset=8
          i32.const 1
          i32.add
          i32.store offset=8
          br 1 (;@2;)
        end
        local.get 3
        i32.const 24
        i32.mul
        local.get 1
        i32.add
        local.tee 5
        i32.load
        local.set 4
        local.get 5
        local.get 4
        local.get 2
        local.get 4
        local.get 2
        i32.lt_u
        select
        i32.store
        local.get 3
        i32.const 24
        i32.mul
        local.get 1
        i32.add
        local.tee 5
        i32.load offset=4
        local.set 4
        local.get 5
        local.get 4
        local.get 2
        local.get 4
        local.get 2
        i32.gt_u
        select
        i32.store offset=4
        local.get 0
        i32.load offset=24
        i32.eqz
        if  ;; label = @3
          local.get 3
          i32.const 24
          i32.mul
          local.get 1
          i32.add
          local.tee 1
          local.get 1
          i32.load offset=12
          i32.const 1
          i32.add
          i32.store offset=12
          br 1 (;@2;)
        end
        local.get 3
        i32.const 24
        i32.mul
        local.get 1
        i32.add
        local.tee 2
        local.get 2
        i32.load offset=16
        i32.const 1
        i32.add
        i32.store offset=16
        local.get 3
        i32.const 24
        i32.mul
        local.get 1
        i32.add
        local.set 1
        local.get 0
        i32.load offset=28
        if  ;; label = @3
          local.get 1
          local.get 1
          i32.load offset=20
          i32.const 1
          i32.add
          i32.store offset=20
        end
      end
    end
    local.get 0
    local.get 3
    i32.const 1
    i32.add
    i32.store
    local.get 0
    i32.const 0
    i32.store offset=4
    local.get 0
    i32.const 1
    i32.store offset=24
    local.get 0
    i64.const 0
    i64.store offset=28 align=4
    local.get 0
    i64.const 0
    i64.store offset=36 align=4)
  (func (;2;) (type 3) (param i32 i32 i32 i32) (result i32)
    (local i32 i32)
    local.get 2
    i32.load8_s
    local.tee 4
    i32.const 255
    i32.and
    local.tee 5
    local.get 1
    i32.load offset=8
    i32.ne
    if  ;; label = @1
      local.get 1
      i32.load offset=4
      local.get 5
      i32.eq
      if  ;; label = @2
        local.get 0
        i32.load offset=16
        i32.eqz
        if  ;; label = @3
          i32.const 4
          return
        end
      end
      local.get 1
      i32.load
      local.get 5
      i32.eq
      if  ;; label = @2
        local.get 0
        i32.load offset=16
        i32.eqz
        if  ;; label = @3
          i32.const 5
          return
        end
      end
      i32.const 6
      return
    end
    local.get 2
    i32.const 1
    i32.add
    local.tee 1
    local.get 3
    i32.lt_u
    if  ;; label = @1
      local.get 1
      i32.load8_s
      local.set 1
      local.get 0
      i32.load offset=4
      i32.eqz
      if  ;; label = @2
        i32.const 1
        i32.const 2
        local.get 1
        local.get 4
        i32.eq
        select
        i32.const 0
        local.get 0
        i32.load offset=16
        select
        return
      end
      local.get 1
      local.get 4
      i32.eq
      if  ;; label = @2
        i32.const 1
        return
      end
    end
    local.get 0
    i32.load offset=16
    if  ;; label = @1
      i32.const 2
      return
    end
    i32.const 3)
  (func (;3;) (type 2) (param i32 i32)
    local.get 0
    local.get 1
    i32.ge_u
    if  ;; label = @1
      return
    end
    local.get 0
    i32.const 0
    local.get 1
    local.get 0
    i32.const -1
    i32.xor
    i32.add
    i32.const 4
    i32.add
    i32.const -4
    i32.and
    call 10
    drop)
  (func (;4;) (type 5) (param i32 i32 i32 i32)
    (local i32)
    local.get 1
    i32.const 0
    i32.store
    local.get 1
    i32.const 4
    i32.const 0
    local.get 0
    i32.load offset=16
    select
    local.tee 4
    i32.store
    local.get 3
    i32.load offset=16
    local.get 0
    i32.load
    i32.ne
    if  ;; label = @1
      local.get 1
      local.get 4
      i32.const 2
      i32.or
      local.tee 4
      i32.store
    end
    local.get 0
    i32.load offset=20
    if  ;; label = @1
      local.get 1
      local.get 4
      i32.const 1
      i32.or
      i32.store
    end
    local.get 0
    i32.load
    local.tee 1
    local.get 3
    i32.load offset=16
    i32.ge_u
    if  ;; label = @1
      local.get 0
      i32.const 0
      i32.store
      local.get 0
      i32.const 0
      i32.store offset=4
      local.get 0
      i32.const 0
      i32.store offset=12
      local.get 0
      i32.const 0
      i32.store offset=20
      local.get 0
      i32.const 0
      i32.store offset=16
      return
    end
    local.get 3
    i32.load offset=12
    local.set 4
    loop  ;; label = @1
      local.get 2
      local.get 1
      i32.const 2
      i32.shl
      local.get 4
      i32.add
      i32.load
      i32.add
      i32.const 0
      i32.store
      local.get 0
      local.get 0
      i32.load
      i32.const 1
      i32.add
      local.tee 1
      i32.store
      local.get 1
      local.get 3
      i32.load offset=16
      i32.lt_u
      br_if 0 (;@1;)
    end
    local.get 0
    i32.const 0
    i32.store
    local.get 0
    i32.const 0
    i32.store offset=4
    local.get 0
    i32.const 0
    i32.store offset=12
    local.get 0
    i32.const 0
    i32.store offset=20
    local.get 0
    i32.const 0
    i32.store offset=16)
  (func (;5;) (type 3) (param i32 i32 i32 i32) (result i32)
    (local i32 i32)
    block  ;; label = @1
      block  ;; label = @2
        local.get 0
        i32.load offset=16
        br_if 0 (;@2;)
        local.get 0
        i32.load
        local.get 1
        i32.load offset=20
        i32.ne
        br_if 0 (;@2;)
        local.get 0
        i32.const 20
        i32.add
        local.tee 1
        i32.load
        br_if 0 (;@2;)
        br 1 (;@1;)
      end
      local.get 2
      local.get 2
      i32.load offset=4
      i32.const 1
      i32.add
      i32.store offset=4
      local.get 0
      i32.const 20
      i32.add
      local.set 1
    end
    local.get 2
    local.get 2
    i32.load offset=8
    local.tee 4
    local.get 0
    i32.load offset=12
    local.tee 5
    local.get 4
    local.get 5
    i32.lt_u
    select
    i32.store offset=8
    local.get 2
    local.get 2
    i32.load offset=12
    local.tee 4
    local.get 5
    local.get 4
    local.get 5
    i32.gt_u
    select
    i32.store offset=12
    local.get 3
    local.get 0
    i32.load offset=8
    i32.store
    local.get 0
    local.get 0
    i32.load offset=12
    local.get 0
    i32.load offset=8
    i32.add
    i32.store offset=8
    local.get 1
    i32.const 0
    i32.store
    local.get 0
    i32.const 0
    i32.store
    local.get 0
    i32.const 0
    i32.store offset=16
    local.get 0
    i32.const 0
    i32.store offset=12
    local.get 2
    local.get 2
    i32.load
    i32.const 1
    i32.add
    i32.store
    local.get 3
    i32.const 4
    i32.add)
  (func (;6;) (type 2) (param i32 i32)
    (local i32)
    local.get 1
    i32.load8_s
    local.tee 2
    i32.const 255
    i32.and
    i32.const -48
    i32.add
    i32.const 10
    i32.lt_u
    if  ;; label = @1
      local.get 0
      local.get 0
      i32.load offset=24
      i32.const 0
      i32.ne
      i32.store offset=24
      return
    end
    local.get 2
    i32.const 46
    i32.eq
    if  ;; label = @1
      local.get 0
      i32.load offset=28
      i32.eqz
      if  ;; label = @2
        local.get 0
        i32.const 1
        i32.store offset=28
        return
      end
    end
    block  ;; label = @1
      local.get 0
      i32.load offset=4
      if  ;; label = @2
        block  ;; label = @3
          block  ;; label = @4
            block  ;; label = @5
              block  ;; label = @6
                local.get 2
                i32.const 13
                i32.sub
                br_table 2 (;@4;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 1 (;@5;) 3 (;@3;) 1 (;@5;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 3 (;@3;) 0 (;@6;) 3 (;@3;)
              end
              local.get 0
              i32.load offset=36
              br_if 4 (;@1;)
              local.get 0
              i32.const 1
              i32.store offset=36
              return
            end
            local.get 1
            i32.const -1
            i32.add
            i32.load8_s
            i32.const 101
            i32.ne
            br_if 3 (;@1;)
            local.get 0
            i32.load offset=40
            br_if 3 (;@1;)
            local.get 0
            i32.const 1
            i32.store offset=40
            return
          end
          return
        end
      else
        block  ;; label = @3
          block  ;; label = @4
            local.get 2
            i32.const 13
            i32.sub
            br_table 0 (;@4;) 3 (;@1;) 3 (;@1;) 3 (;@1;) 3 (;@1;) 3 (;@1;) 3 (;@1;) 3 (;@1;) 3 (;@1;) 3 (;@1;) 3 (;@1;) 3 (;@1;) 3 (;@1;) 3 (;@1;) 3 (;@1;) 3 (;@1;) 3 (;@1;) 3 (;@1;) 3 (;@1;) 3 (;@1;) 3 (;@1;) 3 (;@1;) 3 (;@1;) 3 (;@1;) 3 (;@1;) 3 (;@1;) 3 (;@1;) 3 (;@1;) 3 (;@1;) 3 (;@1;) 3 (;@1;) 3 (;@1;) 1 (;@3;) 3 (;@1;)
          end
          return
        end
        local.get 0
        i32.const 1
        i32.store offset=32
        return
      end
    end
    local.get 0
    i32.const 0
    i32.store offset=24)
  (func (;7;) (type 0) (param i32)
    (local i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32)
    local.get 0
    local.get 0
    i32.const 88
    i32.add
    local.tee 1
    i32.store offset=40
    local.get 0
    i32.const 44
    i32.add
    local.tee 3
    local.get 1
    call 3
    local.get 0
    i32.load
    local.tee 7
    local.get 0
    i32.load offset=4
    local.tee 4
    i32.add
    local.set 9
    local.get 0
    i32.load offset=40
    local.tee 1
    local.get 0
    i32.load offset=12
    i32.load
    i32.add
    local.set 5
    local.get 0
    i32.load offset=56
    local.set 2
    local.get 4
    i32.const 0
    i32.gt_s
    if  ;; label = @1
      local.get 0
      i32.const 28
      i32.add
      local.set 11
      local.get 0
      i32.const -64
      i32.sub
      local.set 12
      local.get 5
      i32.const 4
      i32.add
      local.set 6
      local.get 1
      local.tee 4
      local.set 8
      local.get 7
      local.set 1
      loop (result i32)  ;; label = @2
        local.get 0
        local.get 2
        i32.const 1
        i32.add
        i32.store offset=56
        block  ;; label = @3
          block  ;; label = @4
            block  ;; label = @5
              block  ;; label = @6
                block  ;; label = @7
                  block  ;; label = @8
                    block  ;; label = @9
                      block  ;; label = @10
                        block  ;; label = @11
                          local.get 3
                          local.get 11
                          local.get 1
                          local.get 9
                          call 2
                          br_table 0 (;@11;) 1 (;@10;) 2 (;@9;) 3 (;@8;) 4 (;@7;) 5 (;@6;) 6 (;@5;) 7 (;@4;)
                        end
                        local.get 0
                        i32.const 1
                        i32.store offset=60
                        local.get 1
                        local.set 2
                        local.get 4
                        local.set 1
                        br 7 (;@3;)
                      end
                      local.get 3
                      local.get 1
                      i32.const 1
                      i32.add
                      local.tee 2
                      local.get 6
                      local.get 0
                      call 0
                      local.set 6
                      local.get 0
                      local.get 0
                      i32.load offset=48
                      i32.const 1
                      i32.add
                      i32.store offset=48
                      local.get 0
                      local.get 0
                      i32.load offset=56
                      i32.const 1
                      i32.add
                      i32.store offset=56
                      local.get 4
                      local.set 1
                      br 6 (;@3;)
                    end
                    local.get 0
                    i32.const 0
                    i32.store offset=60
                    local.get 1
                    local.set 2
                    local.get 4
                    local.set 1
                    br 5 (;@3;)
                  end
                  local.get 12
                  i32.const 1
                  i32.store
                  local.get 3
                  local.get 1
                  local.get 6
                  local.get 0
                  call 0
                  local.set 6
                  local.get 0
                  local.get 0
                  i32.load offset=48
                  i32.const 1
                  i32.add
                  i32.store offset=48
                  local.get 1
                  local.set 2
                  local.get 4
                  local.set 1
                  br 4 (;@3;)
                end
                local.get 5
                local.get 0
                i32.load offset=48
                i32.store
                local.get 0
                i32.const 0
                i32.store offset=48
                local.get 3
                local.get 3
                i32.load
                i32.const 1
                i32.add
                local.tee 7
                i32.store
                local.get 7
                local.get 0
                i32.load offset=16
                i32.lt_u
                if  ;; label = @7
                  local.get 1
                  local.set 2
                  local.get 4
                  local.tee 1
                  local.get 0
                  i32.load offset=12
                  local.get 7
                  i32.const 2
                  i32.shl
                  i32.add
                  i32.load
                  i32.add
                  local.tee 5
                  i32.const 4
                  i32.add
                  local.set 6
                else
                  local.get 1
                  local.set 2
                  local.get 4
                  local.set 1
                end
                br 3 (;@3;)
              end
              local.get 3
              i32.load
              local.get 0
              i32.load offset=16
              i32.lt_u
              if  ;; label = @6
                local.get 5
                local.get 0
                i32.load offset=48
                i32.store
                local.get 3
                local.get 3
                i32.load
                i32.const 1
                i32.add
                i32.store
              end
              local.get 3
              local.get 8
              local.get 4
              local.get 0
              call 4
              local.get 1
              local.set 2
              local.get 0
              i32.load offset=40
              local.get 10
              i32.const 1
              i32.add
              local.tee 10
              local.get 0
              i32.load offset=20
              i32.mul
              i32.add
              local.tee 4
              local.get 0
              i32.load offset=12
              i32.load
              i32.add
              local.tee 5
              i32.const 4
              i32.add
              local.set 6
              local.get 4
              local.tee 1
              local.set 8
              br 2 (;@3;)
            end
            local.get 3
            local.get 1
            local.get 6
            local.get 0
            call 0
            local.set 6
            local.get 0
            local.get 0
            i32.load offset=48
            i32.const 1
            i32.add
            i32.store offset=48
            local.get 1
            local.set 2
            local.get 4
            local.set 1
            br 1 (;@3;)
          end
          local.get 1
          local.set 2
          local.get 4
          local.set 1
        end
        local.get 0
        i32.load offset=56
        local.set 7
        local.get 2
        i32.const 1
        i32.add
        local.tee 2
        local.get 9
        i32.lt_u
        if (result i32)  ;; label = @3
          local.get 1
          local.set 4
          local.get 2
          local.set 1
          local.get 7
          local.set 2
          br 1 (;@2;)
        else
          local.get 7
        end
      end
      local.set 2
    else
      local.get 1
      local.set 8
    end
    local.get 2
    i32.eqz
    if  ;; label = @1
      return
    end
    local.get 3
    i32.load
    local.get 0
    i32.load offset=16
    i32.lt_u
    if  ;; label = @1
      local.get 5
      local.get 0
      i32.load offset=48
      i32.store
      local.get 3
      local.get 3
      i32.load
      i32.const 1
      i32.add
      i32.store
    end
    local.get 3
    local.get 8
    local.get 1
    local.get 0
    call 4)
  (func (;8;) (type 0) (param i32)
    (local i32 i32 i32 i32 i32 i32 i32)
    local.get 0
    i32.const 28
    i32.add
    local.tee 3
    local.get 0
    i32.const 100
    i32.add
    local.tee 4
    local.get 0
    i32.load offset=20
    i32.const 24
    i32.mul
    i32.add
    local.tee 5
    call 3
    local.get 0
    local.get 4
    i32.store offset=48
    local.get 0
    local.get 5
    i32.store offset=52
    local.get 0
    local.get 3
    i32.store offset=24
    local.get 0
    i32.const -1
    i32.store offset=36
    local.get 0
    i32.const 24
    i32.store offset=44
    local.get 0
    i32.const 1
    i32.store offset=80
    local.get 0
    i32.load offset=20
    local.tee 2
    if  ;; label = @1
      loop  ;; label = @2
        local.get 1
        i32.const 24
        i32.mul
        local.get 4
        i32.add
        i32.const -1
        i32.store
        local.get 1
        i32.const 1
        i32.add
        local.tee 1
        local.get 2
        i32.lt_u
        br_if 0 (;@2;)
      end
    end
    local.get 0
    i32.const 56
    i32.add
    local.set 2
    local.get 0
    i32.load
    local.tee 1
    local.get 0
    i32.load offset=4
    local.tee 6
    i32.add
    local.set 7
    local.get 0
    i32.load offset=68
    local.set 4
    local.get 6
    i32.const 0
    i32.gt_s
    if  ;; label = @1
      local.get 0
      i32.const 8
      i32.add
      local.set 6
      loop  ;; label = @2
        local.get 0
        local.get 4
        i32.const 1
        i32.add
        i32.store offset=68
        block  ;; label = @3
          block  ;; label = @4
            block  ;; label = @5
              block  ;; label = @6
                block  ;; label = @7
                  block  ;; label = @8
                    block  ;; label = @9
                      block  ;; label = @10
                        local.get 2
                        local.get 6
                        local.get 1
                        local.get 7
                        call 2
                        br_table 0 (;@10;) 1 (;@9;) 2 (;@8;) 3 (;@7;) 4 (;@6;) 5 (;@5;) 6 (;@4;) 7 (;@3;)
                      end
                      local.get 0
                      i32.const 1
                      i32.store offset=72
                      br 6 (;@3;)
                    end
                    local.get 0
                    local.get 0
                    i32.load offset=60
                    i32.const 1
                    i32.add
                    i32.store offset=60
                    local.get 0
                    local.get 0
                    i32.load offset=68
                    i32.const 1
                    i32.add
                    i32.store offset=68
                    local.get 1
                    i32.const 1
                    i32.add
                    local.set 1
                    br 5 (;@3;)
                  end
                  local.get 0
                  i32.const 0
                  i32.store offset=72
                  br 4 (;@3;)
                end
                local.get 0
                i32.const 1
                i32.store offset=76
                local.get 0
                local.get 0
                i32.load offset=60
                i32.const 1
                i32.add
                i32.store offset=60
                br 3 (;@3;)
              end
              local.get 2
              local.get 0
              local.get 3
              call 1
              br 2 (;@3;)
            end
            local.get 2
            local.get 0
            local.get 3
            call 1
            local.get 2
            local.get 0
            local.get 3
            local.get 5
            call 5
            local.set 5
            br 1 (;@3;)
          end
          local.get 2
          local.get 1
          call 6
          local.get 0
          local.get 0
          i32.load offset=60
          i32.const 1
          i32.add
          i32.store offset=60
        end
        local.get 0
        i32.load offset=68
        local.set 4
        local.get 1
        i32.const 1
        i32.add
        local.tee 1
        local.get 7
        i32.lt_u
        br_if 0 (;@2;)
      end
    end
    local.get 4
    i32.eqz
    if  ;; label = @1
      return
    end
    local.get 2
    local.get 0
    local.get 3
    call 1
    local.get 2
    local.get 0
    local.get 3
    local.get 5
    call 5
    drop)
  (func (;9;) (type 0) (param i32)
    (local i32 i32 i32 i32 i32 i32)
    local.get 0
    i32.load offset=8
    local.tee 2
    local.get 0
    i32.load offset=4
    local.tee 4
    i32.lt_u
    if (result i32)  ;; label = @1
      block (result i32)  ;; label = @2
        local.get 0
        i32.load
        local.set 3
        local.get 0
        i32.load offset=12
        local.set 5
        local.get 2
        local.set 1
        loop  ;; label = @3
          local.get 5
          local.get 1
          local.get 3
          i32.add
          i32.load8_u
          i32.ne
          if  ;; label = @4
            local.get 1
            i32.const 1
            i32.add
            local.tee 1
            local.get 4
            i32.lt_u
            if  ;; label = @5
              br 2 (;@3;)
            else
              i32.const 0
              br 3 (;@2;)
            end
            unreachable
          end
        end
        local.get 1
        i32.const 1
        local.get 2
        i32.sub
        i32.add
      end
    else
      i32.const 0
    end
    local.set 3
    local.get 2
    i32.const 0
    i32.gt_s
    if (result i32)  ;; label = @1
      block (result i32)  ;; label = @2
        local.get 0
        i32.load
        local.set 5
        local.get 0
        i32.load offset=12
        local.set 6
        local.get 2
        local.set 1
        loop  ;; label = @3
          local.get 1
          i32.const -1
          i32.add
          local.tee 4
          local.get 5
          i32.add
          i32.load8_u
          local.get 6
          i32.ne
          if  ;; label = @4
            local.get 1
            i32.const 1
            i32.gt_s
            if  ;; label = @5
              local.get 4
              local.set 1
              br 2 (;@3;)
            else
              i32.const 0
              br 3 (;@2;)
            end
            unreachable
          end
        end
        local.get 4
        i32.const 1
        local.get 2
        i32.sub
        i32.add
      end
    else
      i32.const 0
    end
    local.tee 1
    local.get 3
    i32.or
    i32.eqz
    if  ;; label = @1
      local.get 0
      i32.const 0
      i32.store offset=16
      return
    end
    local.get 1
    local.get 3
    local.get 3
    i32.eqz
    local.tee 2
    select
    local.set 4
    local.get 1
    i32.eqz
    local.get 2
    i32.or
    if  ;; label = @1
      local.get 0
      local.get 4
      i32.store offset=16
      return
    end
    local.get 0
    local.get 3
    local.get 1
    local.get 3
    local.get 1
    i32.const 0
    local.get 1
    i32.sub
    local.get 1
    i32.const -1
    i32.gt_s
    select
    i32.lt_s
    select
    i32.store offset=16)
  (func (;10;) (type 1) (param i32 i32 i32) (result i32)
    (local i32 i32 i32 i32)
    local.get 0
    local.get 2
    i32.add
    local.set 4
    local.get 1
    i32.const 255
    i32.and
    local.set 1
    local.get 2
    i32.const 67
    i32.ge_s
    if  ;; label = @1
      loop  ;; label = @2
        local.get 0
        i32.const 3
        i32.and
        if  ;; label = @3
          local.get 0
          local.get 1
          i32.store8
          local.get 0
          i32.const 1
          i32.add
          local.set 0
          br 1 (;@2;)
        end
      end
      local.get 1
      i32.const 8
      i32.shl
      local.get 1
      i32.or
      local.get 1
      i32.const 16
      i32.shl
      i32.or
      local.get 1
      i32.const 24
      i32.shl
      i32.or
      local.set 3
      local.get 4
      i32.const -4
      i32.and
      local.tee 5
      i32.const -64
      i32.add
      local.set 6
      loop  ;; label = @2
        local.get 0
        local.get 6
        i32.le_s
        if  ;; label = @3
          local.get 0
          local.get 3
          i32.store
          local.get 0
          local.get 3
          i32.store offset=4
          local.get 0
          local.get 3
          i32.store offset=8
          local.get 0
          local.get 3
          i32.store offset=12
          local.get 0
          local.get 3
          i32.store offset=16
          local.get 0
          local.get 3
          i32.store offset=20
          local.get 0
          local.get 3
          i32.store offset=24
          local.get 0
          local.get 3
          i32.store offset=28
          local.get 0
          local.get 3
          i32.store offset=32
          local.get 0
          local.get 3
          i32.store offset=36
          local.get 0
          local.get 3
          i32.store offset=40
          local.get 0
          local.get 3
          i32.store offset=44
          local.get 0
          local.get 3
          i32.store offset=48
          local.get 0
          local.get 3
          i32.store offset=52
          local.get 0
          local.get 3
          i32.store offset=56
          local.get 0
          local.get 3
          i32.store offset=60
          local.get 0
          i32.const -64
          i32.sub
          local.set 0
          br 1 (;@2;)
        end
      end
      loop  ;; label = @2
        local.get 0
        local.get 5
        i32.lt_s
        if  ;; label = @3
          local.get 0
          local.get 3
          i32.store
          local.get 0
          i32.const 4
          i32.add
          local.set 0
          br 1 (;@2;)
        end
      end
    end
    loop  ;; label = @1
      local.get 0
      local.get 4
      i32.lt_s
      if  ;; label = @2
        local.get 0
        local.get 1
        i32.store8
        local.get 0
        i32.const 1
        i32.add
        local.set 0
        br 1 (;@1;)
      end
    end
    local.get 4
    local.get 2
    i32.sub)
  (export "_analyzeBuffer" (func 8))
  (export "_findClosestLineBreak" (func 9))
  (export "_loadChunk" (func 7)))
